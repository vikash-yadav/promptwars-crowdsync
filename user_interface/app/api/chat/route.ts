import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json();

  // SECURITY: Basic Sanitization
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ response: "I'm sorry, I couldn't understand that." }, { status: 400 });
  }

  // Remove potential HTML tags to prevent XSS (if rendered raw)
  const sanitizedMessage = message.replace(/<[^>]*>?/gm, '').trim().slice(0, 500);

  if (sanitizedMessage.length === 0) {
    return NextResponse.json({ response: "It seems you sent an empty message. How can I help?" });
  }

  // Mock logic for SyncBot
  let response = "I'm SyncBot, your stadium concierge! How can I help you today?";
  
  const lowerMessage = sanitizedMessage.toLowerCase();

  if (lowerMessage.includes('food') || lowerMessage.includes('hungry') || lowerMessage.includes('burger')) {
    response = "The South Grill (Section 104) has the shortest line right now! It's a 3-minute walk from the North Gate.";
  } else if (lowerMessage.includes('restroom') || lowerMessage.includes('bathroom')) {
    response = "The restrooms near Section 102 are quite busy. I recommend the East Gate concourse restrooms—they have no wait!";
  } else if (lowerMessage.includes('route') || lowerMessage.includes('navigate')) {
    response = "I've updated your live map with the optimal path avoiding the North Concourse congestion.";
  }

  return NextResponse.json({ response });
}
