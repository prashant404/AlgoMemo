const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.explainPattern = async (req, res) => {
  try {
    const { questionTitle, topic } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "API Key missing from .env" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a world-class DSA mentor. Problem: "${questionTitle}" (Category: ${topic}). 
    Explain ONLY the core intuition/aha moment in exactly 2 sentences. No code. No Big O. 
    Focus on WHY this pattern works for this specific problem.`;

    // ✅ Timeout so it never hangs forever
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Gemini request timed out after 10s")),
        10000,
      ),
    );

    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise,
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text)
      return res.status(500).json({ message: "Empty response from Gemini" });

    res.json({ explanation: text });
  } catch (err) {
    console.error("AI SDK Error:", err.message);
    res.status(500).json({ message: "AI Analysis failed", error: err.message });
  }
};
