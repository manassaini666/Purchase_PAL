import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle the route to generate a PayPal Order
export async function POST(request) {
  try {
    /* 
      TODO: Member A & B -> Connect this to the official PayPal Sandbox API.
      You will fetch an access token, then make a POST request to 
      https://paypal.com
    */
    
    // Mocking an order creation token response for your frontend teammate
    const mockOrder = {
      orderID: "MOCK_PAYPAL_ORDER_12345",
      status: "CREATED"
    };

    return NextResponse.json(
      { success: true, order: mockOrder },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to initialize PayPal order" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
