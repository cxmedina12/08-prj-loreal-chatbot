/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Worker URL - this will be your deployed Cloudflare Worker endpoint
const WORKER_URL = "https://project8loreal.cxmedina12.workers.dev";

// Test function to check if Worker is responding
async function testWorkerConnection() {
  try {
    console.log("🔍 Testing Worker connection...");

    // Simple test request to see if Worker responds
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "test connection",
      }),
    });

    console.log("✅ Worker responded with status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Worker response data:", data);

      // Check if the response contains an error (like missing API key)
      if (data.error) {
        console.log("❌ Worker returned an error:", data.error);
        if (data.error.message && data.error.message.includes("API key")) {
          console.log("💡 OpenAI API key is not configured in the worker");
        }
        return false;
      }

      return true;
    } else {
      const errorText = await response.text();
      console.log("❌ Worker error response:", errorText);

      // Check for specific errors
      if (response.status === 404) {
        console.log("💡 Worker might not be deployed yet");
      } else if (response.status === 500) {
        console.log("💡 Worker might be missing API key configuration");
      }

      return false;
    }
  } catch (error) {
    console.log("❌ Failed to connect to Worker:", error.message);

    // Check for specific connection errors
    if (error.message.includes("Failed to fetch")) {
      console.log(
        "💡 Network error - Worker might not be deployed or URL is incorrect"
      );
    }

    return false;
  }
}

// Initialize chat with welcome message
function initializeChat() {
  // Clear the chat window
  chatWindow.innerHTML = "";

  // Add welcome message as AI response
  addMessage(
    "👋 Hello! I'm your dedicated L'Oréal Paris beauty advisor. I can help you discover the perfect L'Oréal products for makeup, skincare, and haircare, plus share expert tips and routines. What L'Oréal beauty questions can I answer for you today?",
    "ai"
  );
}

// Function to add messages to the chat window
function addMessage(message, sender) {
  // Create message element
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("msg", sender);

  // Use innerHTML for better formatting of AI responses
  if (sender === "ai") {
    messageDiv.innerHTML = message;
  } else {
    messageDiv.textContent = message;
  }

  // Add message to chat window
  chatWindow.appendChild(messageDiv);

  // Scroll to bottom to show latest message with smooth animation
  setTimeout(() => {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 100);
}

// Function to check if a message is related to beauty/L'Oréal topics
function isBeautyRelated(message) {
  const beautyKeywords = [
    // L'Oréal products
    "loreal",
    "l'oreal",
    "makeup",
    "foundation",
    "lipstick",
    "mascara",
    "eyeshadow",
    "skincare",
    "moisturizer",
    "cleanser",
    "serum",
    "toner",
    "sunscreen",
    "haircare",
    "shampoo",
    "conditioner",
    "hair",
    "styling",
    "color",
    "fragrance",
    "perfume",
    "cologne",

    // Beauty terms
    "beauty",
    "cosmetics",
    "skin",
    "face",
    "routine",
    "product",
    "brand",
    "application",
    "tips",
    "recommend",
    "advice",
    "help",
    "best",
    "dry skin",
    "oily skin",
    "sensitive skin",
    "acne",
    "aging",
    "coverage",
    "shade",
    "color match",
    "primer",
    "concealer",
    "blush",
    "bronzer",
    "highlighter",
    "eyeliner",
    "brow",

    // General beauty questions
    "how to",
    "what is",
    "which",
    "where",
    "when",
    "why",
  ];

  // Words that indicate non-beauty topics
  const nonBeautyKeywords = [
    "sports",
    "football",
    "basketball",
    "soccer",
    "tennis",
    "golf",
    "politics",
    "government",
    "election",
    "president",
    "vote",
    "political",
    "weather",
    "temperature",
    "rain",
    "snow",
    "forecast",
    "news",
    "current events",
    "stock",
    "market",
    "economy",
    "technology",
    "computer",
    "software",
    "programming",
    "coding",
    "food",
    "recipe",
    "cooking",
    "restaurant",
    "meal",
    "travel",
    "vacation",
    "flight",
    "hotel",
    "destination",
    "movie",
    "film",
    "tv show",
    "entertainment",
    "celebrity",
    "music",
    "song",
    "artist",
    "album",
    "concert",
  ];

  const lowerMessage = message.toLowerCase();

  // Check for explicit non-beauty topics first
  const hasNonBeautyKeywords = nonBeautyKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  if (hasNonBeautyKeywords) {
    return false;
  }

  // Check for beauty-related keywords
  const hasBeautyKeywords = beautyKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  // If it has beauty keywords, it's probably beauty-related
  if (hasBeautyKeywords) {
    return true;
  }

  // For ambiguous questions, let the AI handle it (it has the system prompt)
  // This catches questions like "Can you help me?" which could be beauty-related
  return true;
}

// Function to send message to Cloudflare Worker (which calls OpenAI)
async function sendToOpenAI(userMessage) {
  try {
    // Check if the message is beauty-related before sending to API
    if (!isBeautyRelated(userMessage)) {
      addMessage(
        "I'm a specialized L'Oréal beauty advisor and can only assist with L'Oréal products, skincare routines, makeup tips, and haircare recommendations. Is there anything specific about L'Oréal Paris products I can help you with today?",
        "ai"
      );
      return;
    }

    // Enhanced debugging: Log more details
    console.log("🚀 Sending message to Worker:", userMessage);
    console.log("🌐 Worker URL:", WORKER_URL);

    // Show loading message
    addMessage("Thinking...", "ai");

    // Send request to Cloudflare Worker with more detailed error handling
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userMessage,
      }),
    });

    // Enhanced debugging: Log response details
    console.log("📡 Worker Response status:", response.status);
    console.log("📡 Worker Response headers:", response.headers);

    // Check if the response is successful
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error("❌ Worker Error JSON:", errorData);
      } catch (parseError) {
        const errorText = await response.text();
        console.error("❌ Worker Error Text:", errorText);
        errorData = { error: errorText };
      }
      throw new Error(
        `Worker Error: ${response.status} - ${
          errorData.error || "Unknown error"
        }`
      );
    }

    // Parse the response
    const data = await response.json();
    console.log("✅ Worker Response data:", data);

    // Remove loading message
    const loadingMessage = chatWindow.lastElementChild;
    if (loadingMessage && loadingMessage.textContent === "Thinking...") {
      chatWindow.removeChild(loadingMessage);
    }

    // Check if the response contains an error (OpenAI API error)
    if (data.error) {
      console.error("❌ OpenAI API Error:", data.error);

      // Handle specific OpenAI errors
      if (data.error.message && data.error.message.includes("API key")) {
        addMessage(
          "⚠️ The AI service is not properly configured. Using fallback mode. " +
            generateFallbackResponse(userMessage),
          "ai"
        );
        return;
      } else {
        addMessage(
          "⚠️ AI service error. Using fallback mode. " +
            generateFallbackResponse(userMessage),
          "ai"
        );
        return;
      }
    }

    // Get the AI response - make sure it exists
    const aiResponse =
      data.message ||
      data.response ||
      "Sorry, I didn't receive a proper response.";
    console.log("🤖 AI Response:", aiResponse);

    // Add AI response to chat
    addMessage(aiResponse, "ai");
  } catch (error) {
    // Remove loading message if it exists
    const loadingMessage = chatWindow.lastElementChild;
    if (loadingMessage && loadingMessage.textContent === "Thinking...") {
      chatWindow.removeChild(loadingMessage);
    }

    // Enhanced error logging
    console.error("💥 Error calling Worker:", error);
    console.error("💥 Error stack:", error.stack);

    // Provide fallback response when Worker is not available
    let errorMessage = "I'm currently having connection issues. ";

    if (error.message.includes("Failed to fetch")) {
      errorMessage +=
        "However, I can still help you with L'Oréal beauty advice! ";

      // Provide a helpful fallback response based on the user's message
      const fallbackResponse = generateFallbackResponse(userMessage);
      addMessage(errorMessage + fallbackResponse, "ai");
      return;
    } else if (error.message.includes("401")) {
      errorMessage += "Authentication issue - API key might be missing.";
    } else if (error.message.includes("429")) {
      errorMessage += "Too many requests - please wait a moment.";
    } else if (error.message.includes("500")) {
      errorMessage += "Server error - check Worker logs.";
    } else if (error.message.includes("404")) {
      errorMessage += "Worker not found - check the URL.";
    } else {
      errorMessage += `Error: ${error.message}`;
    }

    addMessage(errorMessage, "ai");
  }
}

// Generate a simple fallback response when the AI service is not available
function generateFallbackResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  // Simple keyword-based responses for common L'Oréal beauty questions
  if (
    lowerMessage.includes("foundation") ||
    lowerMessage.includes("makeup base")
  ) {
    return "For foundation, L'Oréal Paris offers excellent options! Try True Match for natural, buildable coverage that matches your skin perfectly, or Infallible 24HR Fresh Wear for long-lasting, full coverage. Visit a L'Oréal counter for professional color matching!";
  }

  if (lowerMessage.includes("skincare") || lowerMessage.includes("routine")) {
    return "L'Oréal Paris has complete skincare solutions! For a basic routine, try: morning - Revitalift Derm Intensives Vitamin C Serum, then Revitalift Anti-Wrinkle Moisturizer with SPF. Evening - Pure-Clay Detox Cleanser, then Age Perfect Night Cream. All L'Oréal Paris products work beautifully together!";
  }

  if (lowerMessage.includes("lipstick") || lowerMessage.includes("lip")) {
    return "L'Oréal Paris lip products are amazing! For long-lasting color, try Rouge Signature Matte Liquid Lipstick - it's lightweight and stays put all day. For creamy, nourishing coverage, Color Riche Lipstick offers beautiful shades with moisturizing ingredients. What color family are you interested in?";
  }

  if (lowerMessage.includes("hair") || lowerMessage.includes("shampoo")) {
    return "L'Oréal Paris Elvive has targeted solutions for every hair concern! For damaged hair, try Total Repair 5. For volume, use Volume Filler. For color-treated hair, Color Vibrancy is perfect. Each line includes shampoo, conditioner, and treatments for complete hair care.";
  }

  if (lowerMessage.includes("dry skin")) {
    return "For dry skin, L'Oréal Paris Hydra Genius Daily Moisturizer with Hyaluronic Acid provides lasting hydration. Also try Age Perfect Hydra-Nutrition Golden Balm for intense moisture and anti-aging benefits. Both are formulated specifically for dry skin concerns.";
  }

  if (lowerMessage.includes("oily skin")) {
    return "L'Oréal Paris Pure-Clay line is perfect for oily skin! The Detox & Brighten Cleanser with charcoal removes impurities, while the Clarify & Smooth Mask minimizes pores. Use the Oil-Free Moisturizer to hydrate without adding shine.";
  }

  if (lowerMessage.includes("mascara")) {
    return "L'Oréal Paris mascaras are iconic! Voluminous Lash Paradise gives dramatic volume and length, while Telescopic creates precise, separated lashes. For waterproof options, both formulas come in waterproof versions that last all day.";
  }

  if (
    lowerMessage.includes("anti-aging") ||
    lowerMessage.includes("wrinkles")
  ) {
    return "L'Oréal Paris Revitalift line targets aging concerns beautifully! The Derm Intensives Micro Hyaluronic Acid Serum plumps fine lines, while Revitalift Triple Power moisturizer firms, smooths, and brightens. For eyes, try Age Perfect Eye Renewal.";
  }

  // Generic helpful response focused on L'Oréal
  return "I'm here to help you discover the perfect L'Oréal Paris products! L'Oréal offers comprehensive ranges for makeup, skincare, and haircare - all backed by advanced research and beautiful results. Could you tell me more about what specific L'Oréal products or beauty concerns you'd like help with?";
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input
  const message = userInput.value.trim();

  // Don't send empty messages
  if (!message) return;

  // Add user message to chat
  addMessage(message, "user");

  // Clear input field
  userInput.value = "";

  // Send message to Cloudflare Worker (which calls OpenAI)
  await sendToOpenAI(message);
});

// Initialize the chat when page loads and test connection
async function initializeAndTest() {
  // Initialize chat with welcome message
  initializeChat();

  // Test Worker connection
  console.log("🔧 Running connection test...");
  const connectionWorks = await testWorkerConnection();

  if (!connectionWorks) {
    console.log("⚠️ Worker connection test failed!");
    addMessage(
      "⚠️ I'm currently running in offline mode due to connection issues. I can still provide basic L'Oréal beauty advice, but responses will be limited. For full AI-powered assistance, please check the console for deployment details.",
      "ai"
    );
  } else {
    console.log("✅ Worker connection test passed!");
    addMessage(
      "✅ All systems ready! I'm fully connected and ready to help you discover amazing L'Oréal Paris products and beauty solutions.",
      "ai"
    );
  }
}

// Run initialization and test when page loads
initializeAndTest();
