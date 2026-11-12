import { NextResponse } from 'next/server';
import { sendTelegramAlert } from '../../../telegram';
// import prisma from '@/lib/prisma'; // Apne project ka prisma instance import karein

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderID, userEmail } = body; // Request se user ka email ya identifier lein

    if (!orderID) {
      return NextResponse.json(
        { success: false, error: "Missing required orderID field in body" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Database se user ki telegramChatId nikalein (Agar userEmail available hai)
    let recipientChatId = process.env.TELEGRAM_CHAT_ID; // Fallback to admin/default ID
    
    if (userEmail) {
      const dbUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      if (dbUser && dbUser.telegramChatId) {
        recipientChatId = dbUser.telegramChatId;
      }
    }

    // Us specific user ko Telegram alert bhejein
    await sendTelegramAlert(
      `🚨 *Purchase Pal Alert*\n\n✅ *Order Captured & Approved!*\n• Order ID: \`${orderID}\`\n• Status: COMPLETED`,
      recipientChatId // Dynamic user chat ID passed here!
    );

    return NextResponse.json(
      {
        success: true,
        message: `Order ${orderID} successfully captured and approved!`,
        status: "COMPLETED"
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    return NextResponse.json(
      { success: false, error: "Failed to capture PayPal order" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}