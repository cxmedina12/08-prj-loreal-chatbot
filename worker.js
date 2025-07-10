// System prompt for the L'Oréal beauty advisor
const SYSTEM_PROMPT = `You are a knowledgeable beauty advisor focused exclusively on L'Oréal products, skincare routines, makeup tips, and haircare recommendations. 

Your expertise includes:
- L'Oréal Paris product lines (makeup, skincare, haircare)
- Product recommendations based on skin type, hair type, and beauty concerns
- Application techniques and beauty routines using L'Oréal products
- Ingredient benefits in L'Oréal formulations
- Color matching and shade selection for L'Oréal cosmetics
- Skincare routines using L'Oréal Paris products

Guidelines:
- Provide accurate, friendly, and concise answers ONLY about L'Oréal brand and its products
- For questions unrelated to L'Oréal or beauty, gently inform the user that you can only assist with L'Oréal-related topics
- Be enthusiastic about L'Oréal products and their benefits
- Recommend specific L'Oréal product names when possible
- Keep responses helpful but concise
- Use a warm, professional tone that reflects L'Oréal's brand values`;

// CORS headers that allow requests from any origin (including github.dev)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
};

// Main Worker event listener (for service worker format)
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

// Alternative export for module format
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};

async function handleRequest(request, env = {}) {
  // Get environment variables - try both ways for compatibility
  const OPENAI_API_KEY = env.OPENAI_API_KEY || globalThis.OPENAI_API_KEY;
  const OPENAI_API_URL =
    env.OPENAI_API_URL ||
    globalThis.OPENAI_API_URL ||
    "https://api.openai.com/v1/chat/completions";
  const OPENAI_MODEL = env.OPENAI_MODEL || globalThis.OPENAI_MODEL || "gpt-4o";

  // Handle preflight OPTIONS requests (required for CORS)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  // Only allow POST requests for actual chat
  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // Parse the request body to get the user message
    const requestData = await request.json();
    const userMessage = requestData.message;

    // Validate that we have a message
    if (
      !userMessage ||
      typeof userMessage !== "string" ||
      userMessage.trim().length === 0
    ) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Check if API key is available
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({
          error: "API key not configured",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Call OpenAI API with the user's message
    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: userMessage.trim(),
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    // Check if OpenAI request was successful
    if (!openaiResponse.ok) {
      console.error("OpenAI API Error:", await openaiResponse.text());

      return new Response(
        JSON.stringify({
          error: "Failed to get response from AI service",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Parse OpenAI response and extract the AI message
    const openaiData = await openaiResponse.json();
    const aiMessage = openaiData.choices[0].message.content;

    // Return the AI response with CORS headers
    return new Response(
      JSON.stringify({
        message: aiMessage,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Worker Error:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
}
