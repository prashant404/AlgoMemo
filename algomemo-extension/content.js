function scrapeLeetCode() {
  try {
    // 1. Grab Title directly from the big header
    // LeetCode's current UI uses 'text-title-large' for the problem name
    const titleNode = document.querySelector('.text-title-large a') || document.querySelector('.text-title-large');
    let title = titleNode ? titleNode.textContent : document.title.replace(' - LeetCode', '');
    
    // Clean up the string (e.g., "1. Two Sum" -> "Two Sum")
    title = title.trim();

    // 2. Grab Difficulty using their exact color-coded classes
    let difficulty = "Medium"; // Default fallback
    if (document.querySelector('.text-sd-easy')) difficulty = "Easy";
    else if (document.querySelector('.text-sd-medium')) difficulty = "Medium";
    else if (document.querySelector('.text-sd-hard')) difficulty = "Hard";
    
    // Fallback if they change classes again
    else if (document.body.innerText.includes('Easy')) difficulty = "Easy";
    else if (document.body.innerText.includes('Hard')) difficulty = "Hard";

    return { title, difficulty };
  } catch (error) {
    return { title: "Could not scrape title", difficulty: "Medium" };
  }
}

scrapeLeetCode();