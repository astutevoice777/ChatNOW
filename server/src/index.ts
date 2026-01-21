import express from "express";
import cors from "cors";
import router from "./routes/transcribe";

const app = express();

app.use(express.json());
app.use(
  cors(
    {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    })    
);

app.use(router);

app.listen(3003, () => {
  console.log("Server running on http://localhost:3003");
});