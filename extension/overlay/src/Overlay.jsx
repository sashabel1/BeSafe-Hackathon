import { useState } from "react";
import "./overlay.css";

export default function Overlay() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "היי, המערכת זיהתה תוכן שעלול להיות פוגעני. אני כאן בשבילך. מה תרצי לעשות?"
    }
  ]);

  const [showOptions, setShowOptions] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState("");

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const handleOptionClick = (id, text) => {
    addMessage("user", text);

    setTimeout(() => {
      switch (id) {
        case 1:
          addMessage("bot", "✅ אין בעיה. שלחתי הודעה אוטומטית להורים שלך עם המיקום שלך ועדכון שאת צריכה תמיכה.");
          break;
        case 2:
          addMessage("bot", "הנה מספרי חירום חשובים:\n📞 ער\"ן: 1201\n📞 מוקד 105\n📞 משטרה: 100");
          break;
        case 3:
          addMessage("bot", "מעבירה אותך לרשת החברתית המוגנת שלנו... 🌐");
          setTimeout(() => {
            window.open("http://localhost:3000", "_blank");
          }, 2000);
          break;
        case 4:
          addMessage("bot", "אני כאן. ספרי לי מה קרה? אני מקשיבה.");
          setShowOptions(false);
          setShowInput(true);
          break;
      }
    }, 600);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    addMessage("user", input);
    setInput("");

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
      });

      const data = await res.json();

      if (data.reply.includes("[SHOW_OPTIONS]")) {
        addMessage("bot", "בטח, הנה האפשרויות שוב:");
        setShowInput(false);
        setShowOptions(true);
      } else {
        addMessage("bot", data.reply);
      }
    } catch {
      addMessage("bot", "יש בעיה בתקשורת, נסי שוב מאוחר יותר.");
    }
  };

  return (
    <div id="safe-chat-container">
      <div id="chat-header">
        <span>🛡️ עוזרת אישית</span>
        <span
          id="chat-close-btn"
          onClick={() => window.parent.postMessage("CLOSE_OVERLAY", "*")}
        >
          ✖
        </span>
      </div>

      <div id="chat-messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message ${m.sender === "bot" ? "bot-message" : "user-message"}`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {showOptions && (
        <div id="chat-options">
          {[
            "1. לשלוח הודעה להורים",
            "2. מספרי טלפון לעזרה",
            "3. מעבר לרשת החברתית",
            "4. שיחה עם הבוט"
          ].map((text, i) => (
            <button
              key={i}
              className="option-btn"
              onClick={() => handleOptionClick(i + 1, text)}
            >
              {text}
            </button>
          ))}
        </div>
      )}

      {showInput && (
        <div id="chat-input-area">
          <input
            id="user-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="כתבי הודעה..."
          />
          <button id="send-btn" onClick={sendMessage}>➤</button>
        </div>
      )}
    </div>
  );
}
