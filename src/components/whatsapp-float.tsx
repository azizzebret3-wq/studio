// src/components/whatsapp-float.tsx
'use client';

import Link from 'next/link';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21.1 12.8a8.9 8.9 0 0 0-14.2 8.3L3 22l1.9-4.2a8.9 8.9 0 0 0 16.2-3.3Z" />
        <path d="M5.4 12.8a8.9 8.9 0 0 1 12-4.3" />
        <path d="m11.4 14.8-2-2.2" />
        <path d="M14.8 11.4 17 9.2" />
    </svg>
);

export default function WhatsAppFloat() {
    const whatsAppGroupLink = "https://chat.whatsapp.com/BS3jCz7dzQ47cljOBRfFRl?mode=ems_copy_t";

    return (
        <Link 
            href={whatsAppGroupLink}
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform duration-300 hover:scale-110"
            title="Rejoindre le groupe WhatsApp"
        >
            <WhatsAppIcon className="w-8 h-8" />
        </Link>
    );
}
