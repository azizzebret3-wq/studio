// src/components/whatsapp-float.tsx
'use client';

import Link from 'next/link';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M16.75 13.96c.27.13.42.42.31.71l-1.27 3.11a.5.5 0 0 1-.61.31l-2.4-1.2a1.5 1.5 0 0 0-1.08-.05l-1.93.97a.5.5 0 0 1-.57-.61l1.27-3.11a.5.5 0 0 1 .61-.31l2.4 1.2a1.5 1.5 0 0 0 1.08.05l1.93-.97a.5.5 0 0 1 .57.61zM11.5 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9zm0-19.5a10.5 10.5 0 1 0 10.5 10.5A10.5 10.5 0 0 0 12 1.5z"/>
    </svg>
);


export default function WhatsAppFloat() {
    const whatsAppGroupLink = "https://chat.whatsapp.com/BS3jCz7dzQ47cljOBRfFRl?mode=ems_copy_t";

    return (
        <Link 
            href={whatsAppGroupLink}
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-20 lg:bottom-6 right-6 z-50 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform duration-300 hover:scale-110"
            title="Rejoindre le groupe WhatsApp"
        >
            <WhatsAppIcon className="w-8 h-8" />
        </Link>
    );
}