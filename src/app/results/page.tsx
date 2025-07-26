import MatchResults from "@/components/MatchResults";
import Link from "next/link";

export default function MatchResultsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-900 p-8">
      <MatchResults />
      <div className="mt-8">
        <Link href="/admin">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-10 rounded-lg text-lg">
            管理画面に戻る
          </button>
        </Link>
      </div>
    </main>
  );
}
