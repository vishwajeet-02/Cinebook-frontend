import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm CineBot 🎬 Ask me about movies, showtimes, or how to book a ticket."
    }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setSending(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:6060/api/chatbot",
        {
          message: trimmed,
          // Send prior turns as history (excluding the very first
          // canned greeting, which the backend already knows about)
          history: updatedMessages.slice(1, -1)
        },
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined
        }
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.reply }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error.response?.data?.message ||
            "Sorry, I'm having trouble responding right now. Please try again."
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <div>
              <span className="chat-bot-avatar">🎬</span>
              <div>
                <strong>CineBot</strong>
                <small>Booking Assistant</small>
              </div>
            </div>

            <button
              className="chat-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-bubble ${msg.role === "user" ? "user" : "bot"}`}
              >
                {msg.content}
              </div>
            ))}

            {sending && (
              <div className="chat-bubble bot typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-row" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Ask about movies, seats, booking..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
            />

            <button type="submit" disabled={sending || !input.trim()}>
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        className={`chat-toggle-btn ${open ? "open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle chat assistant"
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );
};

export default ChatWidget;
