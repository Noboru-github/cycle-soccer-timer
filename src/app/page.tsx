"use client";

import { useState, useEffect } from "react";

// 定数として試合時間（7分）を秒で定義しておくと便利です
const GAME_TIME_IN_SECONDS = 7 * 60;

export default function ScoreboardPage() {
  // --- ここから state（状態）の定義 ---
  // 残り時間を管理する state。初期値は7分（420秒）
  const [time, setTime] = useState(GAME_TIME_IN_SECONDS);
  // タイマーが作動中かどうかを管理する state (true:作動中, false:停止中)
  const [isActive, setIsActive] = useState(false);
  // 前半/後半を管理する state
  const [period, setPeriod] = useState("1st Half");
  // バックエンドとの通信メッセージを管理する state
  const [backendMessage, setBackendMessage] = useState("サーバーと通信中...");

  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  const [matches, setMatches] = useState([]);

  const fetchMatches = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/matches");
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // --- ここからタイマーの心臓部となるロジック ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    // もしタイマーが作動中(isActive)で、残り時間が0より大きい場合
    if (isActive && time > 0) {
      // 1秒ごと(1000ミリ秒)に残り時間を1ずつ減らす
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      // 時間が0になったらタイマーを停止
      setIsActive(false);
    }

    // このコンポーネントが再描画される前に、古いインターバルを掃除する（非常に重要！）
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, time]); // isActiveかtimeの値が変わるたびに、このuseEffectが再実行される

  // --- バックエンドとの通信ロジック（変更なし） ---
  useEffect(() => {
    const fetchBackendStatus = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/health");
        if (!response.ok)
          throw new Error(`サーバーエラー (ステータス: ${response.status})`);
        const data = await response.json();
        setBackendMessage(data.message);
      } catch (error) {
        console.error("バックエンドとの通信に失敗しました:", error);
        setBackendMessage("サーバーへの接続に失敗しました。");
      }
    };
    fetchBackendStatus();
  }, []);

  // --- ここからボタンが押された時の処理 ---
  const handleStart = () => {
    setIsActive(true); // タイマーを作動中にする
  };

  const handleStop = () => {
    setIsActive(false); // タイマーを停止中にする
  };

  const handleReset = () => {
    setIsActive(false); // タイマーを停止
    setTime(GAME_TIME_IN_SECONDS); // 時間を初期値に戻す
  };

  const handleFinishMatch = async () => {
    console.log("「試合終了」ボタンが押されました。");
    const results = { homeScore: homeScore, awayScore: awayScore };
    try {
      await fetch("http://localhost:3001/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(results),
      });
      alert("試合結果を保存しました！");
      fetchMatches();
      setHomeScore(0);
      setAwayScore(0);
      setTime(GAME_TIME_IN_SECONDS);
      setPeriod("1st Half");
    } catch {
      console.log("エラーが発生しました。");
      alert("エラーが発生しました。試合結果の送信に失敗しました。");
    }
  };

  // --- 時間（秒）を MM:SS 形式の文字列に変換する関数 ---
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    // padStart(2, '0') は、1桁の場合に先頭に0を付けて2桁表示にする処理 (例: 7 → "07")
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleIncreaseHomeScore = () => {
    setHomeScore((prevScore) => prevScore + 1);
  };
  const handleIncreaseAwayScore = () => {
    setAwayScore((prevScore) => prevScore + 1);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-10">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center flex-1">
            <h2 className="text-3xl sm:text-5xl font-bold text-cyan-400">
              HOME TEAM
            </h2>
            <button
              onClick={handleIncreaseHomeScore}
              className="mt-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center text-xl transition"
            >
              +
            </button>
          </div>
          <div className="px-4">
            <span className="text-6xl sm:text-8xl font-mono text-white">
              {homeScore} - {awayScore}
            </span>
          </div>
          <div className="text-center flex-1">
            <h2 className="text-3xl sm:text-5xl font-bold text-amber-400">
              AWAY TEAM
            </h2>
            <button
              onClick={handleIncreaseAwayScore}
              className="mt-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center text-xl transition"
            >
              +
            </button>
          </div>
        </div>

        <div className="text-center my-6 sm:my-10">
          {/* stateのtimeをformatTime関数で整形して表示 */}
          <div className="text-8xl sm:text-9xl font-mono bg-black text-white rounded-lg p-4 inline-block tracking-widest">
            {formatTime(time)}
          </div>
          {/* stateのperiodを表示 */}
          <div className="text-2xl sm:text-4xl font-semibold text-gray-300 mt-3">
            {period}
          </div>
        </div>

        <div className="flex justify-center items-center gap-3 sm:gap-6">
          {/* 各ボタンにonClickイベントとして対応する関数をセット */}
          <button
            onClick={handleStart}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 sm:px-10 rounded-lg text-lg sm:text-2xl transition-transform transform hover:scale-105"
          >
            START
          </button>
          <button
            onClick={handleStop}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 sm:px-10 rounded-lg text-lg sm:text-2xl transition-transform transform hover:scale-105"
          >
            STOP
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 sm:px-10 rounded-lg text-lg sm:text-2xl transition-transform transform hover:scale-105"
          >
            RESET
          </button>
          <button
            onClick={handleFinishMatch}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 sm:px-10 rounded-lg text-lg sm:text-2xl transition-transform transform hover:scale-105"
          >
            Finish!
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400">
        <p>サーバー通信ステータス:</p>
        <p className="font-semibold text-white">{backendMessage}</p>
      </div>
      <div>
        <ul>
          {matches.map((match) => (
            <li key={match.id}>
              試合結果：{match.home_score} - {match.away_score}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
