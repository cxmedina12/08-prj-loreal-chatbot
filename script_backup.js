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
}Form = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Initial message context for the chatbot
const messages = [
  {
    role: "system",
    content:
      "You are a friendly and knowledgeable L’Oréal beauty assistant. Answer questions about skincare, haircare, cosmetics, and L’Oréal product routines. Be helpful and upbeat, and keep answers short and clear. If asked anything off-topic, politely guide the user back to beauty-related questions."
  }
];

// Function to add chat messages to the chat window
function appendMessage(role, text) {
  const messageEl = document.createElement("div");
  messageEl.classList.add("msg", role);
  messageEl.innerHTML = `<div class="bubble">${text}</div>`;
  chatWindow.appendChild(messageEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
// Greet the user on load
appendMessage("ai", "👋 Hey there! I’m your L’Oréal assistant. Ask me about products, routines, or tips!");

// Handle form submission
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  messages.push({ role: "user", content: message });
  userInput.value = "";

  // Show a loading message while waiting
  const loadingEl = document.createElement("div");
  loadingEl.classList.add("msg", "ai");
  loadingEl.innerHTML = `<div class="bubble">💬 Thinking...</div>`;
  chatWindow.appendChild(loadingEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {

    const response = await fetch("https://project8loreal.cxmedina12.workers.dev/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "⚠️ Sorry, I didn’t quite catch that!";
    loadingEl.querySelector(".bubble").textContent = reply;
    messages.push({ role: "assistant", content: reply });

  } catch (error) {
    loadingEl.querySelector(".bubble").textContent = "❌ Something went wrong. Please try again.";
    console.error(error);
  }
});