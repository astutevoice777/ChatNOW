import { Router } from "express";
import { embedText } from "../embeddings";
import { db } from "../db";

const search_router = Router();

/**
 * POST /api/semantic-search
 * body: { query: string }
 */
search_router.post("/semantic-search", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    // 1. Embed query
    const queryEmbedding = await embedText(query);

    // 2. Vector search
    const { rows } = await db.query(
      `
      SELECT meeting_id,
             minutes,
             embedding <-> $1 AS distance
      FROM meeting_minutes
      ORDER BY distance
      LIMIT 3;
      `,
      [queryEmbedding]
    );

    res.json({
      results: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Semantic search failed" });
  }
});

export default search_router;
