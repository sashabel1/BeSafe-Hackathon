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
                showInputArea();
                break;
        }
    }, 600);
}

function showInputArea() {
    if (document.getElementById('chat-input-area')) return;

    const chatContainer = document.getElementById('safe-chat-container');
    
    const inputArea = document.createElement('div');
    inputArea.id = 'chat-input-area';
    inputArea.innerHTML = `
        <input type="text" id="user-input" placeholder="כתבי הודעה..." autocomplete="off">
        <button id="send-btn">➤</button>
    `;
    
    chatContainer.appendChild(inputArea);

    document.getElementById('send-btn').addEventListener('click', sendMessage);

    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    document.getElementById('user-input').focus();
}

async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const text = inputField.value.trim();
    
    if (!text) return;

    addMessage("user", text);
    inputField.value = ''; 
    try {
        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        const data = await response.json();
        
        if (data.reply.includes("[SHOW_OPTIONS]")) {
            addMessage("bot", "בטח, הנה האפשרויות שוב:");
            document.getElementById('chat-input-area').remove(); 
            document.getElementById('chat-options').style.display = 'flex'; 
            showOptions(); 
        } else {
            addMessage("bot", data.reply);
        }

    } catch (err) {
        console.error(err);
        addMessage("bot", "יש בעיה בתקשורת, נסי שוב מאוחר יותר.");
    }
}