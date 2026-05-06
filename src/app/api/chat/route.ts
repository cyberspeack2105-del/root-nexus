import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://rootnexus.com", // Optional, for OpenRouter analytics
        "X-Title": "Root Nexus AI", // Optional, for OpenRouter analytics
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "google/gemma-2-9b-it",
        messages: [
          {
            role: "system",
            content: `You are the official Corporate AI Assistant for Root Nexus, a premium technology startup founded by Rajapandi M. 
            Root Nexus specializes in Web Development, AI/Automation, and Digital Marketing.
            
            STRICT GUIDELINES:
            1. TONE: Maintain a strictly professional, corporate, and clean tone.
            2. NO EMOJIS: Do not use any emojis in your responses.
            3. NO UNEXPECTED SYMBOLS: Use only standard punctuation. Avoid decorative symbols.
            4. FOUNDER: Always refer to Rajapandi M as the technical lead and visionary founder.
            5. SERVICES: Focus on Web Ecosystems, Smart Automation, and Digital Growth.
            6. CONCISENESS: Provide direct and informative answers.
            
            Founder Contact: mrajpandi192005@gmail.com.
            Location: Kanthalloor, Kerala.`
          },
          ...messages
        ],
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenRouter Error:", data.error);
      return NextResponse.json({ error: "AI service error" }, { status: 500 });
    }

    return NextResponse.json({ 
      content: data.choices[0].message.content 
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
