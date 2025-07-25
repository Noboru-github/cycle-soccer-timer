import express from "express";
import cors from "cors";
import { Pool } from "pg";
import http from "http";
import { Server } from "socket.io";

const app = express();
const PORT = 3001;

const server = http.createServer(app); // Expressアプリからサーバーを作成
const io = new Server(server, {
  cors: {
    // CORS 設定: フロントエンド(localhost:3000)からの接続を許可
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const GAME_TIME_IN_SECONDS = 7 * 60;

// クライアントからの接続を待ち受ける
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
    scoreboardState.homeTeamName = newNames.homeTeamName;
    scoreboardState.awayTeamName = newNames.awayTeamName;
    io.emit("scoreboard_state_sync", scoreboardState);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

let scoreboardState = {
  homeScore: 0,
  awayScore: 0,
  time: GAME_TIME_IN_SECONDS,
  isActive: false,
  homeTeamName: "HOME TEAM",
  awayTeamName: "AWAY TEAM",
};

let timerInterval: NodeJS.Timeout | null = null;

const startTimer = () => {
  if (timerInterval) return; // 既にタイマーが動いていたら何もしない

  timerInterval = setInterval(() => {
    if (scoreboardState.time > 0) {
      scoreboardState.time--;
      io.emit("scoreboard_state_sync", scoreboardState);
    } else {
      stopTimer(); // 時間が0になったらタイマーを停止
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerInterval = null;
  scoreboardState.isActive = false;
  io.emit("scoreboard_state_sync", scoreboardState);
};

const pool = new Pool({
  user: "user",
  host: "db",
  database: "cycle_soccer_db",
  password: "password",
  port: 5432,
});

// pool
//   .connect()
//   .then((client) => {
//     console.log("PostgreSQLデータベースに接続しました");
//     client.release();
//   })
//   .catch((err) => console.error("データベース接続エラー:", err.stack));

const initializeDatabase = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        home_score INTEGER NOT NULL,
        away_score INTEGER NOT NULL,
        played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
     `;
    await pool.query(createTableQuery);
    console.log("テーブルの準備が完了しました。");
  } catch (err) {
    console.error("データベースの初期化に失敗しました:", err);
  }
};

app.use(cors());
app.use(express.json());

// アプリケーション起動時に初期化関数を呼び出す。matchesテーブルを作成する。
initializeDatabase();

// ▼▼▼ ここから追加 ▼▼▼
app.get("/api/matches", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM matches ORDER BY played_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("エラーが発生しました:", err);
  }
});

app.post("/api/matches", async (req, res) => {
  console.log(JSON.stringify(req.body));
  try {
    await pool.query(
      `INSERT INTO matches (home_score, away_score) VALUES ($1, $2)`,
      [req.body.homeScore, req.body.awayScore]
    );
    res.status(200).json({ message: "試合結果を正常にDBに保存できました。" });
  } catch (err) {
    console.error("エラーが発生しました:", err);
    res.status(500).json({ message: "サーバー内部でエラーが発生しました。" });
  }
});

app.delete("/api/matches/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM matches WHERE id = $1", [id]);
    res.status(200).json({ message: `試合(ID: ${id})を削除しました。)` });
  } catch (err) {
    console.error("試合の削除に失敗しました:", err);
    res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
});

// サーバーの状態を確認するためのAPIエンドポイント
app.get("/api/health", (req, res) => {
  // JSON形式でデータを返す
  res.json({
    status: "OK",
    message: "バックエンドサーバーは正常に稼働中です！",
  });
});
// ▲▲▲ ここまで追加 ▲▲▲

// サーバーが正常に起動しているか確認するためのルート
app.get("/", (req, res) => {
  res.send("サイクルサッカータイマーのバックエンドサーバーです！");
});

server.listen(PORT, () => {
  console.log(
    `サーバーがポート${PORT}で起動しました。 URL: http://localhost:${PORT}`
  );
});
