document.addEventListener('DOMContentLoaded', () => {
  const settingsView = document.getElementById('settingsView');
  const mainView = document.getElementById('mainView');
  const tokenInput = document.getElementById('tokenInput');
  const saveTokenBtn = document.getElementById('saveTokenBtn');
  const syncBtn = document.getElementById('syncBtn');
  const statusTxt = document.getElementById('status');

  let jwtToken = "";

  // Set this to your localhost for now. Once we confirm it works, we switch it to Render!
const API_URL = "https://algomemo-1.onrender.com/api/notes";
  // 1. Check if user already saved their token
  chrome.storage.local.get(['algomemo_token'], (result) => {
    if (result.algomemo_token) {
      jwtToken = result.algomemo_token;
      showMainUi();
    } else {
      settingsView.classList.remove('hidden');
    }
  });

  // 2. Save Token Button
  saveTokenBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim();
    if (token) {
      chrome.storage.local.set({ algomemo_token: token }, () => {
        jwtToken = token;
        showMainUi();
      });
    }
  });

  // 3. Extract data from LeetCode
  async function showMainUi() {
    settingsView.classList.add('hidden');
    mainView.classList.remove('hidden');

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes("leetcode.com/problems/")) {
      document.getElementById('title').value = "Open a LeetCode problem first!";
      syncBtn.disabled = true;
      syncBtn.style.background = "#334155";
      return;
    }

    // Inject the scraper script into the page
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }, (results) => {
      if (results && results && results.result) {
        const data = results.result;
        document.getElementById('title').value = data.title;
        document.getElementById('difficulty').value = data.difficulty;
      }
    });
  }

  // 4. Send Data to AlgoMemo Backend
  syncBtn.addEventListener('click', async () => {
    syncBtn.innerText = "Syncing...";
    
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const title = document.getElementById('title').value;
    const difficulty = document.getElementById('difficulty').value;
    const topic = document.getElementById('topic').value;
    const trick = document.getElementById('trick').value;

    // Generate a quick ID from the title (e.g. "1. Two Sum" -> "two-sum")
    const questionId = title.toLowerCase().replace(/[0-9.]/g, '').trim().replace(/\s+/g, '-');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          questionId: questionId,
          title: title,
          topic: topic,
          difficulty: difficulty,
          trick: trick || "Auto-synced via extension.",
          url: tab.url,
          code: "// Code auto-scraping coming in V2" 
        })
      });

      if (response.ok) {
        statusTxt.innerText = "✅ Synced to AlgoMemo!";
        statusTxt.style.color = "#10b981"; // Emerald
        syncBtn.innerText = "Done";
        setTimeout(() => window.close(), 2000);
      } else {
        const errData = await response.json();
        statusTxt.innerText = `❌ Error: ${errData.message || "Failed"}`;
        statusTxt.style.color = "#f43f5e"; // Rose
        syncBtn.innerText = "Try Again";
      }
    } catch (err) {
      statusTxt.innerText = "❌ Server offline or CORS issue.";
      statusTxt.style.color = "#f43f5e";
      syncBtn.innerText = "Try Again";
    }
  });
});