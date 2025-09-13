// src/app/api/cinetpay-notify/route.ts
import { NextResponse } from 'next/server';
import { updateUserSubscriptionInFirestore } from '@/lib/firestore.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cpm_trans_id, cpm_site_id, cpm_amount, cpm_trans_status, cpm_custom, cpm_currency } = body;
    
    // Check if the site ID matches your site ID from environment variables
    if (cpm_site_id !== process.env.CINETPAY_SITE_ID) {
      console.warn('CinetPay Webhook: Received notification for wrong site ID.', { received: cpm_site_id });
      return new NextResponse('Invalid site ID', { status: 400 });
    }
    
    // The user's UID is passed in the cpm_custom metadata field
    const userId = cpm_custom;

    if (!userId) {
        console.error('CinetPay Webhook: User ID (cpm_custom) is missing from notification.', body);
        return new NextResponse('User ID is missing', { status: 400 });
    }

    // Now, verify the transaction status with CinetPay's server for security
    const verifyUrl = 'https://api-checkout.cinetpay.com/v2/payment/check';
    const verificationData = {
      apikey: process.env.CINETPAY_API_KEY!,
      site_id: cpm_site_id,
      transaction_id: cpm_trans_id,
    };
    
    const verificationResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verificationData),
    });

    if (!verificationResponse.ok) {
      throw new Error(`CinetPay verification request failed with status ${verificationResponse.status}`);
    }

    const result = await verificationResponse.json();
    
    if (result.code === '00') {
      const { status } = result.data;
      if (status === 'ACCEPTED') {
        // Payment is confirmed, update the user's subscription
        await updateUserSubscriptionInFirestore(userId, 'premium');
        console.log(`CinetPay Webhook: Successfully upgraded user ${userId} to premium.`);
      } else {
        console.log(`CinetPay Webhook: Payment for user ${userId} was not accepted. Status: ${status}`);
      }
    } else {
      console.error('CinetPay Webhook: Transaction verification failed.', result);
    }
    
    // Always return a 200 OK response to CinetPay to acknowledge receipt
    return new NextResponse('Notification received', { status: 200 });

  } catch (error) {
    console.error('CinetPay Webhook Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
