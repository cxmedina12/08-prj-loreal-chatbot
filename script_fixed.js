/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Worker URL - your deployed Cloudflare Worker endpoint
const WORKER_URL = "https://project8loreal.cxmedina12.workers.dev";

// Test function to check if Worker is responding
async function testWorkerConnection() {
  try {
    console.log("🔍 Testing Worker connection...");

    // Send a minimal valid messages array for testing
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful L'Oréal beauty advisor." },
          { role: "user", content: "test connection" },
        ],
      }),
    });

    console.log("✅ Worker responded with status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Worker response data:", data);

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

      if (response.status === 404) {
        console.log("💡 Worker might not be deployed yet");
      } else if (response.status === 500) {
        console.log("💡 Worker might be missing API key configuration");
      }

      return false;
    }
  } catch (error) {
    console.log("❌ Failed to connect to Worker:", error.message);

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
  chatWindow.innerHTML = "";

  addMessage(
    "👋 Hello! I'm your dedicated L'Oréal Paris beauty advisor. I can help you discover the perfect L'Oréal products for makeup, skincare, and haircare, plus share expert tips and routines. What L'Oréal beauty questions can I answer for you today?",
    "ai"
  );
}

// Function to add messages to the chat window
function addMessage(message, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("msg", sender);

  if (sender === "ai") {
    messageDiv.innerHTML = message;
  } else {
    messageDiv.textContent = message;
  }

  chatWindow.appendChild(messageDiv);

  setTimeout(() => {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 100);
}

// Function to check if message is related to beauty topics
function isBeautyRelated(message) {
  const beautyKeywords = [
    "loreal","l'oreal","makeup","foundation","lipstick","mascara","eyeshadow",
    "skincare","moisturizer","cleanser","serum","toner","sunscreen","haircare",
    "shampoo","conditioner","hair","styling","color","fragrance","perfume",
    "cologne","beauty","cosmetics","skin","face","routine","product","brand",
    "application","tips","recommend","advice","help","best","dry skin","oily skin",
    "sensitive skin","acne","aging","coverage","shade","color match","primer",
    "concealer","blush","bronzer","highlighter","eyeliner","brow","how to","what is",
    "which","where","when","why"
  ];

  const nonBeautyKeywords = [
    "sports","football","basketball","soccer","tennis","golf","politics","government",
    "election","president","vote","political","weather","temperature","rain","snow",
    "forecast","news","current events","stock","market","economy","technology",
    "computer","software","programming","coding","food","recipe","cooking","restaurant",
    "meal","travel","vacation","flight","hotel","destination","movie","film","tv show",
    "entertainment","celebrity","music","song","artist","album","concert"
  ];

  const lowerMessage = message.toLowerCase();

  if (nonBeautyKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return false;
  }

  return beautyKeywords.some(keyword => lowerMessage.includes(keyword)) || true;
}

// Send message to Cloudflare Worker (calls OpenAI)
async function sendToOpenAI(userMessage) {
  try {
    if (!isBeautyRelated(userMessage)) {
      addMessage(
        "I'm a specialized L'Oréal beauty advisor and can only assist with L'Oréal products, skincare routines, makeup tips, and haircare recommendations. Is there anything specific about L'Oréal Paris products I can help you with today?",
        "ai"
      );
      return;
    }

    console.log("🚀 Sending message to Worker:", userMessage);
    console.log("🌐 Worker URL:", WORKER_URL);

    addMessage("Thinking...", "ai");

    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful L'Oréal beauty advisor." },
          { role: "user", content: userMessage },
        ],
      }),
    });

    console.log("📡 Worker Response status:", response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error("❌ Worker Error JSON:", errorData);
      } catch {
        const errorText = await response.text();
        console.error("❌ Worker Error Text:", errorText);
        errorData = { error: errorText };
      }
      throw new Error(
        `Worker Error: ${response.status} - ${errorData.erro
