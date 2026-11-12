import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // Apne project ka prisma import check kar lein
import bcrypt from 'bcrypt'; // Agar passwords bcrypt se hashed hain

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 1. Database mein user ko dhoondhein
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 2. Password verify karein (Bcrypt use ho raha hai toh bcrypt.compare karein)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    // Agar passwords plain text mein hain toh seedha check kar sakte hain: (password === user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 3. Login Successful
    return NextResponse.json(
      { success: true, message: 'Login successful', user: { email: user.email } },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}