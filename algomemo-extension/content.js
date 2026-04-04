function scrapeLeetCode() {
  try {
    // ✅ Multiple selectors — LeetCode changes their UI often
    const titleNode = 
      document.querySelector('[data-cy="question-title"]') ||
      document.querySelector('.text-title-large a') ||
      document.querySelector('.text-title-large') ||
      document.querySelector('h1');

    let title = titleNode 
      ? titleNode.textContent.trim() 
      : document.title.replace(' - LeetCode', '').trim();
    
    // Remove number prefix "1. Two Sum" → "Two Sum"
    title = title.replace(/^\d+\.\s*/, '').trim();

    // ✅ Difficulty detection with multiple fallbacks
    let difficulty = "Medium";
    
    const easyEl = document.querySelector('[class*="text-sd-easy"], [class*="difficulty-easy"]');
    const hardEl = document.querySelector('[class*="text-sd-hard"], [class*="difficulty-hard"]');
    
    if (easyEl) {
      difficulty = "Easy";
    } else if (hardEl) {
      difficulty = "Hard";
    } else {
      // Fallback — scan leaf elements for exact difficulty text
      document.querySelectorAll('*').forEach(el => {
        if (el.children.length === 0) {
          const text = el.textContent.trim();
          if (text === 'Easy') difficulty = 'Easy';
          if (text === 'Hard') difficulty = 'Hard';
        }
      });
    }

    return { title, difficulty };
  } catch (error) {
    return { title: "Could not scrape", difficulty: "Medium" };
  }
}

scrapeLeetCode();