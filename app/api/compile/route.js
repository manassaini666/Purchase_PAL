import { NextResponse } from 'next/server';

// Configuration for cross-origin frontend testing
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allows your frontend teammate to connect safely
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 1. Handle the Compiler POST request
export async function POST(request) {
  try {
    // Reads data sent from frontend (e.g., { text: "Your prompt or policy text here" })
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Missing required text field in body" },
        { status: 400, headers: corsHeaders }
      );
    }

    /* 
      TODO: Member A & B -> Integrate your LLM framework here.
      Example: Call OpenAI, Anthropic, or a custom local model.
    */
    const mockCompiledOutput = `[Compiled Output for]: ${text}`;

    // Return the successful response to the frontend UI
    return NextResponse.json(
      { 
        success: true, 
        message: "Compilation completed successfully!", 
        compiledData: mockCompiledOutput 
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server or invalid JSON error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// 2. Handle the CORS Preflight check from browser
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
