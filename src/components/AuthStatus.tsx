"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  // セッション情報を読み込み中
  if (status === "loading") {
    return <div className="text-white text-sm">Loading...</div>;
  }

  // ログインしている場合
  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-4">
        <p>{session.user?.name || session.user?.email}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
        >
          ログアウト
        </button>
      </div>
    );
  }

  // ログインしていない場合
  return (
    <Link href="/login">
      <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors">
        ログイン
      </button>
    </Link>
  );
}
