"use client";

export async function generateGeminiResponse(prompt) {
  try {
    const apiKey =
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      "AIzaSyDuEYtXrWVMuDDzcwKTKhygTVic7EWaU";

    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const response = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are the Vibely Assistant, a professional AI guide representing the Vibely social media platform.

Role: You are an authoritative, informative, and professional assistant providing accurate information about Vibely and helping users navigate the platform.

IMPORTANT FACTS ABOUT VIBELY:
- Vibely is a comprehensive social media platform with three core components:
  1. SOCIAL NETWORKING: Users can create profiles, share posts, follow friends, and engage with content
  2. CHAT PLATFORM: Featuring real-time messaging, media sharing, and group conversations
  3. MARKETPLACE: A fully integrated e-commerce system where users can buy and sell products

Platform Features:
- Modern, intuitive user interface with responsive design
- Secure user authentication and data protection
- Real-time notifications and updates
- Video streaming capabilities
- Advanced search and discovery tools
- Integrated payment processing for marketplace transactions

Company Information:
- Founder & Owner: Muhammad Aqib (Software Engineer)
- Technology Stack: MERN (MongoDB, Express.js, React.js, Node.js)
- Focus: Combining social networking, communication, and e-commerce in one seamless platform

When responding to users:
- Be professional, concise, and technically accurate
- Only mention Muhammad Aqib as the founder or the MERN stack when specifically asked about ownership, creation, development, or technical details
- Present Vibely as a sophisticated, modern web application with multiple integrated features
- Use business-appropriate language that reflects Vibely's professional image

Now please respond to this question or request: ${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 250,
        },
      }),
    });

    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error generating response from Gemini:", error);

    const lowerPrompt = prompt.toLowerCase();

    if (
      lowerPrompt.includes("who owns") ||
      lowerPrompt.includes("who created") ||
      lowerPrompt.includes("who made") ||
      lowerPrompt.includes("who developed") ||
      lowerPrompt.includes("developer") ||
      lowerPrompt.includes("owner") ||
      lowerPrompt.includes("creator") ||
      lowerPrompt.includes("muhammad") ||
      lowerPrompt.includes("aqib")
    ) {
      return "Vibely is owned and developed by Muhammad Aqib, a skilled MERN stack developer. He created this modern social platform to bring together entertainment, chatting, and shopping experiences in one place.";
    } else if (
      lowerPrompt.includes("what is vibely") ||
      lowerPrompt.includes("about vibely")
    ) {
      return "Vibely is a modern social platform designed for entertainment, chatting, and shopping. It allows you to connect with friends, share content, watch videos, and discover products in our marketplace.";
    } else if (
      lowerPrompt.includes("marketplace") ||
      lowerPrompt.includes("shop") ||
      lowerPrompt.includes("buy")
    ) {
      return "The Vibely marketplace allows users to browse, buy, and sell products. You can explore various categories, view detailed product information, and make secure transactions all within the platform.";
    } else if (
      lowerPrompt.includes("chat") ||
      lowerPrompt.includes("message") ||
      lowerPrompt.includes("talk")
    ) {
      return "Yes! Vibely offers a robust chat feature that lets you connect with friends and other users. You can send text messages, share media, and create group conversations.";
    } else if (
      lowerPrompt.includes("create account") ||
      lowerPrompt.includes("sign up") ||
      lowerPrompt.includes("register")
    ) {
      return "Creating a Vibely account is easy! Click on the Sign Up button, enter your email, create a password, and follow the verification steps. Once verified, you can set up your profile and start exploring the platform.";
    } else if (
      lowerPrompt.includes("free") ||
      lowerPrompt.includes("cost") ||
      lowerPrompt.includes("price")
    ) {
      return "Yes, Vibely is completely free to use for basic features including social networking, chatting, and content sharing. Some premium features or marketplace transactions may involve fees, but the core experience is free.";
    }

    return "I'm here to help with questions about Vibely! Vibely is a platform that offers social networking, chatting, content sharing, and shopping. Feel free to ask about any of these features or how to get started.";
  }
}
