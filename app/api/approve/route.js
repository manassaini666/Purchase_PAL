import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle the route to Capture/Approve a completed PayPal Order
export async function POST(request) {
  try {
    const body = await request.json();
    const { orderID } = body;

    if (!orderID) {
      return NextResponse.json(
        { success: false, error: "Missing required orderID field in body" },
        { status: 400, headers: corsHeaders }
      );
    }

    /* 
      TODO: Member A & B -> Connect this to the official PayPal Sandbox API.
      Make a POST request to:
      https://paypal.com{orderID}/capture
    */

    return NextResponse.json(
      { 
        success: true, 
        message: `Order ${orderID} successfully captured and approved!`,
        status: "COMPLETED"
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to capture PayPal order" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
