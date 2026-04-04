document.addEventListener('DOMContentLoaded', () => {
  const settingsView = document.getElementById('settingsView');
  const mainView = document.getElementById('mainView');
  const tokenInput = document.getElementById('tokenInput');
  const saveTokenBtn = document.getElementById('saveTokenBtn');
  const syncBtn = document.getElementById('syncBtn');
  const statusTxt = document.getElementById('status');

  // ✅ Point to your Render backend
  const API_URL = "https://algomemo-1.onrender.com/api/notes";

  let jwtToken = "";

  // ─── 1. Check saved token on load ───────────────────────────
  chrome.storage.local.get(['algomemo_token'], (result) => {
    if (result.algomemo_token) {
      jwtToken = result.algomemo_token;
      showMainUi();
    } else {
      settingsView.classList.remove('hidden');
    }
  });

  // ─── 2. Save token ──────────────────────────────────────────
  saveTokenBtn.addEventListener('click', () => {
    const token = tokenInput.value.trim().replace(/^"(.*)"$/, '$1'); // strip quotes
    if (token) {
      chrome.storage.local.set({ algomemo_token: token }, () => {
        jwtToken = token;
        showMainUi();
      });
    } else {
      alert("Please paste a valid token!");
    }
  });

  // ─── 3. Switch account / logout ─────────────────────────────
  document.getElementById('logoutBtn').addEventListener('click', () => {
    chrome.storage.local.remove('algomemo_token', () => {
      mainView.classList.add('hidden');
      settingsView.classList.remove('hidden');
      tokenInput.value = '';
    });
  });

  // ─── 4. Show main UI and scrape LeetCode ────────────────────
  async function showMainUi() {
    settingsView.classList.add('hidden');
    mainView.classList.remove('hidden');

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url || !tab.url.includes("leetcode.com/problems/")) {
      document.getElementById('title').value = "⚠️ Open a LeetCode problem first!";
      document.getElementById('difficulty').value = "";
      syncBtn.disabled = true;
      syncBtn.style.background = "#334155";
      syncBtn.innerText = "Open a LeetCode problem first";
      return;
    }

    // ✅ Inject content script and grab results
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.error("Script inject error:", chrome.runtime.lastError.message);
        document.getElementById('title').value = "Error reading page — try refreshing LeetCode";
        return;
      }

      // ✅ Fixed: results[0].result (not results.result)
      if (results && results[0] && results[0].result) {
        const data = results[0].result;
        document.getElementById('title').value = data.title || "Unknown";
        document.getElementById('difficulty').value = data.difficulty || "Medium";
      } else {
        document.getElementById('title').value = "Could not read — try refreshing LeetCode";
      }
    });
  }

  // ─── 5. Sync to AlgoMemo ────────────────────────────────────
  syncBtn.addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const difficulty = document.getElementById('difficulty').value;
    const topic = document.getElementById('topic').value;
    const confidence = document.getElementById('confidence').value;
    const trick = document.getElementById('trick').value;

    if (!title || title.includes('⚠️') || title.includes('Could not')) {
      statusTxt.innerText = "❌ No valid problem detected!";
      statusTxt.style.color = "#f43f5e";
      return;
    }

    syncBtn.disabled = true;
    syncBtn.innerText = "Syncing...";
    statusTxt.innerText = "";

    // Generate questionId from title e.g. "Two Sum" → "two-sum"
    const questionId = title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          questionId,
          topic,
          content: trick || "Auto-synced via AlgoMemo Chrome Extension.",  // ✅ backend expects 'content'
          theTrick: trick || "",                                             // ✅ backend expects 'theTrick'
          confidence,                                                        // ✅ Easy / Medium / Hard
          timeComplexity: "O(N)",
          spaceComplexity: "O(1)",
        })
      });

      if (response.ok) {
        const data = await response.json();
        statusTxt.innerText = `✅ Synced! Streak: 🔥${data.streak || 0}`;
        statusTxt.style.color = "#10b981";
        syncBtn.innerText = "✅ Done!";
        syncBtn.style.background = "#059669";
        setTimeout(() => window.close(), 2500);
      } else {
        const errData = await response.json();
        statusTxt.innerText = `❌ ${errData.message || "Sync failed"}`;
        statusTxt.style.color = "#f43f5e";
        syncBtn.innerText = "Try Again";
        syncBtn.disabled = false;
        syncBtn.style.background = "#6366f1";
      }
    } catch (err) {
      console.error("Fetch error:", err);
      statusTxt.innerText = "❌ Server offline or CORS issue.";
      statusTxt.style.color = "#f43f5e";
      syncBtn.innerText = "Try Again";
      syncBtn.disabled = false;
      syncBtn.style.background = "#6366f1";
    }
  });
});