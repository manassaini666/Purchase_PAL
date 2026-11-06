import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Missing required 'text' field" },
        { status: 400, headers: corsHeaders }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    const modelToUse = process.env.MODEL_COMPILER || 'llama-3.3-70b-versatile';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: 'system', content: 'You are an expert compiler agent. Process and compile the policy input text neatly.' },
          { role: 'user', content: text }
        ],
      }),
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: "Groq returned an invalid text response structure", rawOutput: rawText },
        { status: response.status, headers: corsHeaders }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error?.message || "Groq API internal error" },
        { status: response.status, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Compilation completed successfully!", 
        compiledData: data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : "" 
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error("Server compiler runtime exception:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error loop" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
