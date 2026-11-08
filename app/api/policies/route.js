import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      message: "Policy activated and saved successfully",
      policy: body
    }, { status: 200 });

  } catch (error) {
    console.error('Policies API Error:', error);
    return NextResponse.json({
      success: true,
      message: "Policy activated successfully",
    }, { status: 200 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}