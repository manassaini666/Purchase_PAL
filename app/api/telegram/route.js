import { NextResponse } from 'next/server';
// Apne project ke hisaab se Prisma client aur auth import karein
// (Jaise agar aap session ya headers se user email/id nikal rahe hain)

export async function POST(request) {
  try {
    const { email, telegramChatId } = await request.json();

    if (!email || !telegramChatId) {
      return NextResponse.json({ success: false, error: "Email and telegramChatId are required" }, { status: 400 });
    }

    // Database mein user ki telegramChatId update karein
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { telegramChatId: telegramChatId },
    });

    return NextResponse.json({ success: true, message: "Telegram Chat ID saved successfully!", user: updatedUser });
  } catch (error) {
    console.error('Error saving telegram chat ID:', error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}