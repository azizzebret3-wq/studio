import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3" passHref>
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-lg tracking-tighter drop-shadow-lg">GTC</span>
        </div>
      </div>
      <div className="hidden sm:block">
        <h1 className="text-lg font-black gradient-text tracking-tight">
          Gagne ton concours
        </h1>
      </div>
    </Link>
  );
}
