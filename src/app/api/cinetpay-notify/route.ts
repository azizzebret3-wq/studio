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

async function getUserIdFromPhone(phoneNumber: string): Promise<string | null> {
    if (!phoneNumber) return null;
    const usersRef = collection(db, "users");
    // CinetPay may add country code, so we check for both formats
    const phoneWithPlus = `+${phoneNumber}`;
    
    // We will query for the phone number ending with the provided number
    // This is a workaround since Firestore doesn't support "endsWith" queries directly
    // A more robust solution might involve normalizing phone numbers on signup.
    const q = query(usersRef, where("phone", "==", phoneNumber));
    const qWithPlus = query(usersRef, where("phone", "==", phoneWithPlus));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    }

    const querySnapshotWithPlus = await getDocs(qWithPlus);
    if (!querySnapshotWithPlus.empty) {
        return querySnapshotWithPlus.docs[0].id;
    }
    
    // As a last resort, try to find user by the metadata stored in Cinetpay transaction
    const qByMeta = query(usersRef, where("uid", "==", phoneNumber));
    const querySnapshotByMeta = await getDocs(qByMeta);
    if (!querySnapshotByMeta.empty) {
        return querySnapshotByMeta.docs[0].id;
    }


    return null;
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { transaction_id } = data;

        if (!transaction_id) {
            return NextResponse.json({ error: 'Transaction ID is missing' }, { status: 400 });
        }

        const transactionDetails = await getTransactionStatus(transaction_id);
        const { code, message, data: transactionData } = transactionDetails;

        if (code !== '00') {
             console.error('CinetPay check error:', message);
            // Even if we can't check, CinetPay might have sent valid data. We log and proceed.
            // In production, you might want to handle this differently.
        }

        if (transactionData && transactionData.status === 'ACCEPTED') {
            const customerPhoneNumber = transactionData.customer_phone_number || transactionData.metadata;
            
            if (!customerPhoneNumber) {
                 console.error("No UID or phone number found in transaction metadata or customer details");
                 return NextResponse.json({ error: 'No user identifier found' }, { status: 400 });
            }

            // The metadata field now contains the Firebase UID
            const userId = customerPhoneNumber;
            
            await updateUserSubscriptionInFirestore(userId, 'premium');
            console.log(`Successfully upgraded user ${userId} to premium.`);
            
            return NextResponse.json({ message: 'User upgraded to premium' });

        } else if (transactionData) {
            console.log(`Transaction ${transaction_id} not accepted. Status: ${transactionData.status}`);
            return NextResponse.json({ message: 'Payment not successful' }, { status: 200 });
        } else {
             console.error('CinetPay check response was invalid:', transactionDetails);
             return NextResponse.json({ error: 'Invalid CinetPay response' }, { status: 500 });
        }

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
