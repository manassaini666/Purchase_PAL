import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const msg = await client.messages.create({
  model: process.env.MODEL_SHOPPER,
  max_tokens: 50,
  messages: [{ role: "user", content: "Say: key works" }],
});
console.log(msg.content[0].text);