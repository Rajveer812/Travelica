const chatBox = document.getElementById("chatMessages");
const input = document.getElementById("userInput");
const typingIndicator = document.getElementById("typingIndicator");

function addMessage(text, type) {
  const wrapper = document.createElement("div");
  wrapper.className = `msg-row ${type}`;

  const bubble = document.createElement("div");
  bubble.className = `msg-bubble ${type}`;
  bubble.innerText = text;

  wrapper.appendChild(bubble);
  chatBox.insertBefore(wrapper, typingIndicator); // ⬅ insert before typing
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
  typingIndicator.classList.remove("d-none");
  chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
  typingIndicator.classList.add("d-none");
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  showTyping(); // ✅ AI typing starts

  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        city: sessionStorage.getItem("userCity"),
        lat: sessionStorage.getItem("lat"),
        lng: sessionStorage.getItem("lng")
      })
    });

    const data = await res.json();

    hideTyping(); // ✅ AI typing stops
    addMessage(data.reply || "No response from AI.", "ai");
  } catch (err) {
    console.error(err);
    hideTyping();
    addMessage("AI is temporarily unavailable.", "ai");
  }
}
