"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Scoreboard from "@/components/Scoreboard";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // セッション読み込み中は何もしない
    
    if (status === "unauthenticated") {
      // 未ログインの場合はログインページにリダイレクト
      router.push("/login");
    }
  }, [status, router]);

  // セッション読み込み中の表示
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // 未ログインの場合は何も表示しない（リダイレクト処理中）
  if (status === "unauthenticated") {
    return null;
  }

  // ログイン済みの場合のみScoreboardを表示
  return <Scoreboard showControls={true} />;
}
