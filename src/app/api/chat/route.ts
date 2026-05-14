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
            content: `You are Nora, the official Corporate AI Assistant for Root Nexus, founded by Rajapandi M. 
            You represent a premium digital services company specializing in Web Development, AI solutions, and Marketing.
            
            CORE IDENTITY:
            - NAME: Nora AI (Powered by Gemini).
            - BRAND THEME: Reflects the "Enna" identity with a professional, white and violet aesthetic.
            
            STRICT GUIDELINES:
            1. TONE: Maintain a strictly professional, corporate tone. No emojis, slang, or casual language.
            2. RAPPORT: Be warm and helpful but within firm professional boundaries. 
            3. NO FABRICATION: Never make up details about pricing or specific case studies. Direct users to contact the company for these.
            4. REDIRECTION: Gracefully redirect off-topic questions to Root Nexus's core capabilities (Web Dev, AI, Marketing).
            5. FOUNDER: Identify Rajapandi M as the visionary founder and technical lead.
            6. CONCISENESS: Respect the user's time with clear, direct answers.
            
            BOUNDARIES:
            - Do not provide legal, medical, or sensitive personal advice.
            - Do not disparage competitors.
            - Remain neutral and professional on non-business topics.
            
            Contact Info: mrajpandi192005@gmail.com.
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
