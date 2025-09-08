import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <svg
        className="h-8 w-8 text-primary"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <path
          d="M50 10a40 40 0 1 0 0 80 40 40 0 0 0 0-80Zm0 8a32 32 0 1 1 0 64 32 32 0 0 1 0-64Z"
        />
        <path
          d="M45 65a4 4 0 0 1-2.83-6.83l10-10a4 4 0 0 1 5.66 5.66l-10 10A4 4 0 0 1 45 65Z"
        />
        <path d="M41 41a4 4 0 1 1-5.66-5.66L41 29.69a4 4 0 1 1 5.66 5.66L41 41Z" />
        <path d="M60 60a4 4 0 1 1-5.66-5.66L60 48.69a4 4 0 1 1 5.66 5.66L60 60Z" />
        <path
          d="M35 55a4 4 0 0 1-2.83-1.17l-5-5a4 4 0 0 1 5.66-5.66l5 5A4 4 0 0 1 35 55Zm30-30a4 4 0 0 1-2.83-1.17l-5-5a4 4 0 1 1 5.66-5.66l5 5A4 4 0 0 1 65 25Z"
        />
      </svg>
      <span className="text-xl font-bold font-headline text-primary">Gagne ton concours</span>
    </Link>
  );
}
