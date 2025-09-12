// src/components/tiktok-float.tsx
'use client';

import Link from 'next/link';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12.52.02c1.31-.02 2.61.1 3.82.38a9.42 9.42 0 0 1 5.02 5.02 9.42 9.42 0 0 1-.38 12.38 9.42 9.42 0 0 1-5.02 5.02 9.42 9.42 0 0 1-12.38-.38 9.42 9.42 0 0 1-5.02-5.02 9.42 9.42 0 0 1 .38-12.38A9.42 9.42 0 0 1 12.52.02Z" />
        <path d="M15.54 8.52a3 3 0 0 0-2.03-2.03c.12-.02.24-.03.37-.03 1.09 0 2.18.39 3.03 1.1.2.16.4.32.57.51" />
        <path d="M15.54 8.52a3.01 3.01 0 0 0-3.3-2.43 3 3 0 0 0-2.83 2.83v5.66a3 3 0 0 1-3 3" />
    </svg>
);


export default function TiktokFloat() {
    const tiktokLink = "https://www.tiktok.com/@prepare.concours?_t=ZM-8zfqR0jZffk&_r=1";

    return (
        <Link 
            href={tiktokLink}
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-36 lg:bottom-24 right-6 z-50 bg-black text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-transform duration-300 hover:scale-110"
            title="Suivez-nous sur TikTok"
        >
            <TikTokIcon className="w-7 h-7" />
        </Link>
    );
}
