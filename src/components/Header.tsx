import Link from "next/link";
import AuthStatus from "./AuthStatus";

export default function Header() {
  return (
    <header className="bg-gray-800 shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-white hover:text-gray-300"
        >
          Cycle Soccer Timer
        </Link>
        <AuthStatus />
      </nav>
    </header>
  );
}
