// src/app/api/cinetpay-notify/route.ts
// This file is no longer in use since the payment method was switched to manual.
// It can be safely deleted or kept for future reference.

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('CinetPay notification received, but is no longer processed.');
  return new NextResponse('Notification received but not processed.', { status: 200 });
}
