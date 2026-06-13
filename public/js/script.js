(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

function toggleChat() {
  document.getElementById("chat-window").classList.toggle("open");
}

async function sendMessage() {
  const input = document.getElementById("chat-input");
  const messages = document.getElementById("chat-messages");
  const userText = input.value.trim();
  if (!userText) return;

  input.value = "";

  // User message
  const userDiv = document.createElement("div");
  userDiv.className = "user-msg";
  userDiv.textContent = userText;
  messages.appendChild(userDiv);

  // Typing indicator
  const typingDiv = document.createElement("div");
  typingDiv.className = "typing-msg";
  typingDiv.textContent = "Typing...";
  messages.appendChild(typingDiv);
  messages.scrollTop = messages.scrollHeight;

  try {
    const res = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
    });
    const data = await res.json();
    typingDiv.remove();

    const botDiv = document.createElement("div");
    botDiv.className = "bot-msg";
    botDiv.textContent = data.reply;
    messages.appendChild(botDiv);
  } catch (err) {
    typingDiv.textContent = "Kuch error aa gaya, dobara try karo!";
  }

  messages.scrollTop = messages.scrollHeight;
}