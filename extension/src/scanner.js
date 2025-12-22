//function to simulate AI content checking
async function checkContentWithAI(textToCheck) {
  console.log("Sending to Backend: ", textToCheck);
  
  try {
    const response = await fetch('http://localhost:3000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textToCheck })
    });

    const data = await response.json();
    console.log("AI Result:", data);

    return data.is_harmful; 
  } catch (error) {
    console.error("Failed to connect to AI server:", error);
    return false;
  }
}

// function to trigger support chat
function triggerSupportChat() {
  console.log("!!! Triggering support alert !!!");
  const notification = document.createElement('div');
  notification.innerText = "⚠️ זוהה תוכן שעלול להיות פוגעני. האם את צריכה תמיכה?";
  
  Object.assign(notification.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#ff4d4d',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '8px',
    zIndex: '9999',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    fontFamily: 'Arial, sans-serif',
    direction: 'rtl'
  });

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}


let textBuffer = ""; 
let scanTimeout;
const recentlySeenText = new Set();

function handleNewText(newText) {

  const cleanText = newText ? newText.trim() : "";

  if (cleanText.length < 3) return;
  if (recentlySeenText.has(cleanText)) {
      return; 
  }

  recentlySeenText.add(cleanText);
  setTimeout(() => recentlySeenText.delete(cleanText), 10000);

  //add new text to buffer
  textBuffer += " " + newText;

  //reset timeout if already set     
  if (scanTimeout) clearTimeout(scanTimeout);

  //set new timeout
  scanTimeout = setTimeout(async () => {
    const currentText = textBuffer;
    textBuffer = ""; 
    const isHarmful = await checkContentWithAI(currentText);
    if (isHarmful) {
      triggerSupportChat(); 
    }
  }, 3000); 
}


//Observer the DOM for new messages
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      mutation.addedNodes.forEach((node) => {
        
        //ignore if inside safe chat container
        if (node.id === "safe-chat-container" || node.parentElement?.id === "safe-chat-container") {
             return;
        }

        //check if node has text
        if (node.innerText) {
           handleNewText(node.innerText);
        }
      });
    }
    //check for existing text changes
    if (mutation.type === 'characterData') {
       handleNewText(mutation.target.textContent);
    }
  });
});

//start observing the body for changes
observer.observe(document.body, {
  childList: true,      
  subtree: true,        
  characterData: true   
});


//first scan of existing content, waits 2 seconds for page to load
setTimeout(() => {
    console.log("Initial delayed scan");
    handleNewText(document.body.innerText);
}, 2000);