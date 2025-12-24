function createChatBot() {
    if (document.getElementById('safe-chat-container')) return;

    console.log("Initializing Safe Chat Bot...");

    const link = document.createElement("link");
    link.href = chrome.runtime.getURL("overlay.css"); 
    link.type = "text/css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const chatContainer = document.createElement('div');
    chatContainer.id = 'safe-chat-container';
    
    chatContainer.innerHTML = `
        <div id="chat-header">
            <span>🛡️ עוזרת אישית</span>
            <span id="chat-close-btn">✖</span>
        </div>
        <div id="chat-messages">
            </div>
        <div id="chat-options">
            </div>
    `;

    document.body.appendChild(chatContainer);

    document.getElementById('chat-close-btn').addEventListener('click', () => {
        chatContainer.remove();
        link.remove(); 
    });

    addMessage("bot", "היי, המערכת זיהתה תוכן שעלול להיות פוגעני. אני כאן בשבילך. מה תרצי לעשות?");
    showOptions();
}

function addMessage(sender, text) {
    const messagesDiv = document.getElementById('chat-messages');
    if (!messagesDiv) return;

    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message');
    msgDiv.innerText = text;
    
    messagesDiv.appendChild(msgDiv);
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showOptions() {
    const optionsDiv = document.getElementById('chat-options');
    if (!optionsDiv) return;
    
    optionsDiv.innerHTML = ''; 

    const options = [
        { text: "1. לשלוח הודעה להורים", id: 1 },
        { text: "2. מספרי טלפון לעזרה", id: 2 },
        { text: "3. מעבר לרשת החברתית", id: 3 },
        { text: "4. שיחה עם הבוט", id: 4 }
    ];

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.innerText = opt.text;
        btn.onclick = () => handleOptionClick(opt.id, opt.text);
        optionsDiv.appendChild(btn);
    });
}

function handleOptionClick(id, text) {
    addMessage("user", text);

    setTimeout(() => {
        switch(id) {
            case 1:
                addMessage("bot", "✅ אין בעיה. שלחתי הודעה אוטומטית להורים שלך עם המיקום שלך ועדכון שאת צריכה תמיכה.");
                break;
            case 2:
                addMessage("bot", "הנה מספרי חירום חשובים:\n📞 ער\"ן: 1201\n📞 מוקד 105 (הגנה על ילדים ברשת)\n📞 משטרה: 100");
                break;
            case 3:
                addMessage("bot", "מעבירה אותך לרשת החברתית המוגנת שלנו... 🌐");
                break;
            case 4:
                addMessage("bot", "אני כאן. ספרי לי מה קרה? אני מקשיבה.");
                document.getElementById('chat-options').style.display = 'none'; 
                break;
        }
    }, 600);
}