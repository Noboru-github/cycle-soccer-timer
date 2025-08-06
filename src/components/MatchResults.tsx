"use client";

import { useState, useEffect } from "react";

interface Match {
  id: number;
  home_score: number;
  away_score: number;
  played_at: string;
}

// const API_BASE_URL = "";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"; // ローカル用

export default function MatchResults() {
  const [matches, setMatches] = useState<Match[]>([]);

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/matches`);
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleDeleteMatch = async (id: number) => {
    if (!confirm(`試合(ID: ${id})を本当に削除しますか？`)) {
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/api/matches/${id}`, {
        method: "DELETE",
      });
      alert("試合結果を削除しました！");
      fetchMatches();
    } catch (err) {
      console.error("削除に失敗しました。", err);
      alert("削除に失敗しました。");
    }
  };

  return (
    <div className="w-full max-w-3xl mt-10 text-white">
      <h3 className="text-2xl font-bold mb-4">試合結果一覧</h3>
      <div className="overflow-x-auto relative shadow-md rounded-lg">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs uppercase bg-gray-700 text-gray-300">
            <tr>
              <th scope="col" className="px-6 py-3">
                試合日時
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                HOME
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                AWAY
              </th>
              <th scope="col" className="px-6 py-3 text-center text-red-500">
                Delete?
              </th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr
                key={match.id}
                className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600"
              >
                <td className="px-6 py-4">
                  {new Date(match.played_at).toLocaleString("ja-JP")}
                </td>
                <td className="px-6 py-4 text-center font-medium text-white">
                  {match.home_score}
                </td>
                <td className="px-6 py-4 text-center font-medium text-white">
                  {match.away_score}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleDeleteMatch(match.id)}
                    className="font-medium text-red-500 hover:underline"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
