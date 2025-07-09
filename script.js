/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Initialize chat with welcome message
function initializeChat() {
  // Clear the chat window
  chatWindow.innerHTML = "";

  // Add welcome message as AI response
  addMessage(
    "👋 Hello! I'm your L'Oréal beauty advisor. How can I help you with makeup, skincare, haircare, or beauty routines today?",
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

// Function to send message to OpenAI API
async function sendToOpenAI(userMessage) {
  try {
    // Debug: Log that we're starting the API call
    console.log("Sending message to OpenAI:", userMessage);
    console.log("Using API key:", OPENAI_API_KEY ? "✓ Key loaded" : "✗ No key");

    // Show loading message
    addMessage("Thinking...", "ai");

    // Prepare the API request
    const response = await fetch(OPENAI_API_URL, {
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
            content: userMessage,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    // Debug: Log response status
    console.log("API Response status:", response.status);

    // Check if the response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error details:", errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // Parse the response
    const data = await response.json();
    console.log("API Response data:", data);

    // Remove loading message
    const loadingMessage = chatWindow.lastElementChild;
    if (loadingMessage && loadingMessage.textContent === "Thinking...") {
      chatWindow.removeChild(loadingMessage);
    }

    // Get the AI response
    const aiResponse = data.choices[0].message.content;
    console.log("AI Response:", aiResponse);

    // Add AI response to chat
    addMessage(aiResponse, "ai");
  } catch (error) {
    // Remove loading message if it exists
    const loadingMessage = chatWindow.lastElementChild;
    if (loadingMessage && loadingMessage.textContent === "Thinking...") {
      chatWindow.removeChild(loadingMessage);
    }

    // Show detailed error message
    console.error("Error calling OpenAI API:", error);

    // More specific error messages for debugging
    let errorMessage = "Sorry, I'm having trouble connecting right now. ";

    if (error.message.includes("401")) {
      errorMessage += "Please check your API key.";
    } else if (error.message.includes("429")) {
      errorMessage += "Too many requests - please wait a moment.";
    } else if (error.message.includes("Network")) {
      errorMessage += "Network connection issue.";
    } else {
      errorMessage += "Please try again in a moment.";
    }

    addMessage(errorMessage, "ai");
  }
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

  // Send message to OpenAI API
  await sendToOpenAI(message);
});

// Initialize the chat when page loads
initializeChat();
