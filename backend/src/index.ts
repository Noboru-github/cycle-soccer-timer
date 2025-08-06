import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import matchesRouter from "./routes/matches";
import signupRouter from "./routes/signup";

// --- 初期設定 ---
const app = express();
const PORT = 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "DELETE"],
  },
});
const GAME_TIME_IN_SECONDS = 7 * 60;

// --- ミドルウェア設定 ---
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// --- APIルーターの設定 ---
app.use("/api", matchesRouter);
app.use("/api", signupRouter);

// --- リアルタイム処理用のインメモリ状態管理 ---
let scoreboardState = {
  homeScore: 0,
  awayScore: 0,
  time: GAME_TIME_IN_SECONDS,
  isActive: false,
  homeTeamName: "HOME TEAM",
  awayTeamName: "AWAY TEAM",
};

let timerInterval: NodeJS.Timeout | null = null;

// --- タイマー関数 ---
const startTimer = () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (scoreboardState.time > 0 && scoreboardState.isActive) {
      scoreboardState.time--;
      io.emit("scoreboard_state_sync", scoreboardState);
    } else {
      stopTimer();
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  scoreboardState.isActive = false;
  io.emit("scoreboard_state_sync", scoreboardState);
};

// --- Socket.IO イベントリスナー ---
io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);
  socket.emit("scoreboard_state_sync", scoreboardState);

  socket.on("increase_home_score", () => {
    scoreboardState.homeScore++;
    io.emit("scoreboard_state_sync", scoreboardState);
  });
  socket.on("increase_away_score", () => {
    scoreboardState.awayScore++;
    io.emit("scoreboard_state_sync", scoreboardState);
  });
  socket.on("decrease_home_score", () => {
    if (scoreboardState.homeScore > 0) scoreboardState.homeScore--;
    io.emit("scoreboard_state_sync", scoreboardState);
  });
  socket.on("decrease_away_score", () => {
    if (scoreboardState.awayScore > 0) scoreboardState.awayScore--;
    io.emit("scoreboard_state_sync", scoreboardState);
  });
  socket.on("reset_scores", () => {
    scoreboardState.homeScore = 0;
    scoreboardState.awayScore = 0;
    io.emit("scoreboard_state_sync", scoreboardState);
  });
  socket.on("start_timer", () => {
    scoreboardState.isActive = true;
    startTimer();
    io.emit("scoreboard_state_sync", scoreboardState);
  });
  socket.on("stop_timer", () => {
    stopTimer();
  });
  socket.on("reset_timer", () => {
    stopTimer();
    scoreboardState.time = GAME_TIME_IN_SECONDS;
    io.emit("scoreboard_state_sync", scoreboardState);
  });
  socket.on("update_team_names", (newNames) => {
    scoreboardState.homeTeamName = newNames.home;
    scoreboardState.awayTeamName = newNames.away;
    io.emit("scoreboard_state_sync", scoreboardState);
  });
  socket.on("add_second", () => {
    scoreboardState.time += 1;
    io.emit("scoreboard_state_sync", scoreboardState);
  });
  socket.on("subtract_second", () => {
    if (scoreboardState.time > 0) {
      scoreboardState.time -= 1;
      io.emit("scoreboard_state_sync", scoreboardState);
    }
  });
  socket.on("add_minute", () => {
    scoreboardState.time += 60;
    io.emit("scoreboard_state_sync", scoreboardState);
  });
  socket.on("subtract_minute", () => {
    if (scoreboardState.time >= 60) {
      scoreboardState.time -= 60;
      io.emit("scoreboard_state_sync", scoreboardState);
    }
  });
  socket.on("disconnect", () => console.log("user disconnected:", socket.id));
});

// --- サーバー稼働確認 ---
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK" });
});

// --- サーバー起動 ---
server.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました。`);
});
