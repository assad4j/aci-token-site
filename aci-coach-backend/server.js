// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// --------- CONFIG ----------
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
// ---------------------------

app.post("/api/coach", async (req, res) => {
  try {
    const {
      text,
      lang = "fr-FR",
      emotion = "neutral",
      arousal = 0.3,
      valence = 0.3,
      stressScore = 0.2,
    } = req.body || {};

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const system = `
Tu es Coach ACI, expert en psychologie du trading et de l'investissement.
Tu es empathique, structuré, orienté protocole (exercices, checklists).
Langue: ${lang}. Tient compte de l’état utilisateur:
emotion=${emotion}, arousal=${arousal}, valence=${valence}, stress=${stressScore}.
Donne des réponses détaillées mais claires, avec un mini-plan d’action en 3 étapes.
`;

    const payload = {
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: text || "" },
      ],
      temperature: 0.7,
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const t = await r.text();
      return res.status(500).json({ error: "OpenAI error", detail: t });
    }

    const json = await r.json();
    const reply = json?.choices?.[0]?.message?.content?.trim() || "…";
    return res.json({
      reply,
      mood: "calm",
      intention: "coaching",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_fail" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Coach API running on :${PORT}`));
