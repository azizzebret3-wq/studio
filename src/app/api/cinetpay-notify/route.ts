// src/app/api/cinetpay-notify/route.ts
import { NextResponse } from 'next/server';
import { updateUserSubscriptionInFirestore } from '@/lib/firestore.service';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';


async function getTransactionStatus(transactionId: string) {
    const response = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            apikey: process.env.NEXT_PUBLIC_CINETPAY_API_KEY,
            site_id: process.env.NEXT_PUBLIC_CINETPAY_SITE_ID,
            transaction_id: transactionId,
        })
    });
    return response.json();
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { transaction_id } = data;

        if (!transaction_id) {
            console.error('CinetPay Notify: Transaction ID is missing from the request body.', data);
            return NextResponse.json({ error: 'Transaction ID is missing' }, { status: 400 });
        }

        console.log(`CinetPay Notify: Received notification for transaction_id: ${transaction_id}`);

        const transactionDetails = await getTransactionStatus(transaction_id);
        const { code, message, data: transactionData } = transactionDetails;

        if (code !== '00') {
             console.error(`CinetPay check error for transaction ${transaction_id}:`, message);
             // In a real production environment, you might want to retry or flag this for manual review.
             // We'll return an error to CinetPay so they might retry the notification.
             return NextResponse.json({ error: 'Failed to verify transaction with CinetPay', details: message }, { status: 500 });
        }

        if (transactionData && transactionData.status === 'ACCEPTED') {
            // The Firebase user UID should be in the 'metadata' field.
            const userId = transactionData.metadata;
            
            if (!userId) {
                 console.error(`CinetPay Notify: No Firebase UID found in metadata for transaction ${transaction_id}.`, transactionData);
                 return NextResponse.json({ error: 'User identifier (UID) not found in transaction metadata' }, { status: 400 });
            }

            // Update user subscription to 'premium' in Firestore
            await updateUserSubscriptionInFirestore(userId, 'premium');
            console.log(`CinetPay Notify: Successfully upgraded user ${userId} to premium for transaction ${transaction_id}.`);
            
            // Respond to CinetPay that we have successfully processed the notification
            return NextResponse.json({ message: 'User upgraded to premium' });

        } else if (transactionData) {
            console.log(`CinetPay Notify: Transaction ${transaction_id} not successful. Status: ${transactionData.status}`);
            return NextResponse.json({ message: 'Payment not successful' }, { status: 200 });
        } else {
             console.error(`CinetPay Notify: Invalid response from CinetPay check for transaction ${transaction_id}:`, transactionDetails);
             return NextResponse.json({ error: 'Invalid CinetPay response' }, { status: 500 });
        }

    } catch (error) {
        console.error('CinetPay webhook processing error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
