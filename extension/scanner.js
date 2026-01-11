//function to simulate AI content checking
async function scanText(text) {
  
  try {

    const { API_URL } = await new Promise((resolve) =>
      chrome.storage.local.get("API_URL", resolve)
    );

    const finalApiUrl = API_URL || "http://localhost:5000/analyze";

    if (!finalApiUrl) {
      console.error("API_URL not available");
      return null;
    }

    const response = await fetch(finalApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text })
    });

    if (!response.ok) {
      console.error("Server error:", response.status);
      return { is_harmful: false, error: true };
;
    }

    const data = await response.json();
    return data; 

  } catch (error) {
    console.error("Failed to connect to AI server:", error);
    return null;
  }
}

let iframe = null;
// function to trigger support chat
function triggerSupportChat() {
  if (iframe) return;

  iframe = document.createElement("iframe");

  iframe.src = chrome.runtime.getURL("overlay/dist/index.html");

  Object.assign(iframe.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "320px",
    height: "480px",
    border: "none",
    zIndex: 999999
  });

  document.body.appendChild(iframe);
}

window.addEventListener("message", (e) => {
  if (e.data === "CLOSE_OVERLAY" && iframe) {
    iframe.remove();
    iframe = null;
  }
});

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
    const result = await scanText(currentText);
    if (result?.is_harmful === true) {
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

