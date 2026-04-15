import { useState } from 'react'
import axios from 'axios'
import { MessageCircle, X, Send } from 'lucide-react'

// Dynamic API URL (works locally + deployed)
const API_URL = import.meta.env.VITE_API_URL || "http://65.2.188.6:8000";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      text: "Hello! 👋 I'm your AI Health Assistant. Ask me anything about health, habits, BMI, or wellness. Remember — I'm an AI, not a doctor!",
      sender: 'ai'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { text: input, sender: 'user' }

    // Add user message
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post(
        `${API_URL}/chat`,
        { message: userMsg.text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // prevent infinite loading
        }
      )

      const aiReply = res.data?.response || "🤖 No response from server."

      setMessages(prev => [
        ...prev,
        { text: aiReply, sender: 'ai' }
      ])

    } catch (err) {
      console.error("Chat API error:", err)

      let errorMessage = "⚠️ Unable to connect to server."

      if (err.response) {
        errorMessage = `⚠️ Server error (${err.response.status})`
      } else if (err.request) {
        errorMessage = "⚠️ Backend not reachable. Check EC2 / CORS."
      }

      setMessages(prev => [
        ...prev,
        { text: errorMessage, sender: 'ai' }
      ])
    }

    setLoading(false)
  }

  return (
    <div className="chatbot-container" id="chatbot">

      {!isOpen && (
        <button
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open health assistant chat"
          id="chatbot-open"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {isOpen && (
        <div className="chat-window" id="chat-window">

          <div className="chat-header">
            <span>🩺 Health Assistant</span>
            <X
              size={20}
              style={{ cursor: 'pointer' }}
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            />
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.sender}`}>
                {m.text}
              </div>
            ))}

            {loading && (
              <div className="msg ai loading-pulse">
                Thinking...
              </div>
            )}
          </div>

          <form className="chat-input" onSubmit={sendMessage}>
            <input
              className="form-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about health, BMI, diet..."
              id="chat-message-input"
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="chat-send-btn"
            >
              <Send size={18} />
            </button>
          </form>

        </div>
      )}
    </div>
  )
}