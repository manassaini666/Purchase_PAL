import Groq from 'groq-sdk';

// Initialize Groq by reading the key loaded into the process context
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function run() {
  const targetModel = 'qwen/qwen3.8-27b';
  
  try {
    console.log(`Connecting to Groq using model: ${targetModel}...`);
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello! Please confirm that our environment configuration and connection are fully operational.' }],
      model: targetModel,
    });

    console.log("\n--- Connection Successful ---");
    console.log(chatCompletion.choices?.[0]?.message?.content || chatCompletion.choices?.message?.content);
    console.log("-----------------------------\n");

  } catch (error) {
    console.error("\n--- Connection Failed ---");
    console.error(error.message || JSON.stringify(error));
    console.log("-------------------------\n");
  }
}

run();


