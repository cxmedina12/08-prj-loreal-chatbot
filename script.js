/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// System prompt: Only discuss L'Oréal products, beauty routines, and recommendations
const systemPrompt =
  "You are a helpful assistant for L'Oréal. Only answer questions about L'Oréal products, beauty routines, and beauty recommendations. If a user asks about anything unrelated, politely reply: 'I'm here to help with L'Oréal products and beauty advice. Please ask me about those topics!'";

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user message
  const message = userInput.value.trim();
  if (!message) return;

  // Show user message in chat window
  appendMessage(message, "user");
  userInput.value = "";

  // Show loading message
  appendMessage("Thinking...", "ai", true);

  // Prepare messages for OpenAI API
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: message },
  ];

  try {
    // Call OpenAI API (gpt-4o)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    // Remove loading message
    removeLoading();

    // Show AI response
    if (data.choices && data.choices[0] && data.choices[0].message) {
      appendMessage(data.choices[0].message.content, "ai");
    } else {
      appendMessage(
        "Sorry, I couldn't get a response. Please try again.",
        "ai"
      );
    }
  } catch (err) {
    removeLoading();
    appendMessage(
      "Error connecting to OpenAI. Please check your API key and try again.",
      "ai"
    );
  }
});

// Helper: Add a message to the chat window
function appendMessage(text, sender, isLoading = false) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${sender}`;
  if (isLoading) msgDiv.classList.add("loading");
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Helper: Remove loading message
function removeLoading() {
  const loadingMsg = chatWindow.querySelector(".msg.ai.loading");
  if (loadingMsg) loadingMsg.remove();
}
