import express from "express";
import cors from "cors";
import router from "./routes/transcribe";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(router);

app.get("/api/openai-test", async (_, res) => {
  try {
    const openai = new (await import("openai")).default({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const r = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: "Say hello",
    });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});


app.listen(3003, () => {
  console.log("Server running on http://localhost:3003");
});
