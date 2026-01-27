import express from "express";
import cors from "cors";
import router from "./routes/transcribe";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (origin === process.env.FRONTEND_URL || origin.startsWith('chrome-extension://')) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(router);

app.listen(3003, () => {
  console.log("Server running on http://localhost:3003");
});