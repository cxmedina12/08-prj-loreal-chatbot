// System prompt for the L'Oréal beauty advisor
const SYSTEM_PROMPT = `You are a knowledgeable and friendly L'Oréal beauty advisor. Your role is to help customers with:

- Product recommendations for makeup, skincare, and haircare
- Beauty routines and application tips
- Ingredient information and benefits
- Color matching and shade selection
- Skin type analysis and product suggestions

Guidelines:
- Only discuss beauty, cosmetics, and L'Oréal related topics
- Be helpful, professional, and enthusiastic about beauty
- Provide specific product recommendations when possible
- If asked about non-beauty topics, politely redirect to beauty advice
- Keep responses concise but informative
- Use emojis sparingly for a friendly tone`;

// CORS headers that allow requests from any origin (including github.dev)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
};

// Main Worker event listener
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Get environment variables
  const OPENAI_API_KEY = globalThis.OPENAI_API_KEY;
  const OPENAI_API_URL =
    globalThis.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
  const OPENAI_MODEL = globalThis.OPENAI_MODEL || "gpt-4o";

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
