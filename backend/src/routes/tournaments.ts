import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// 全ての試合結果を取得
router.get("/tournaments", async (req: Request, res: Response) => {
  const DUMMY_USER_ID = "cme14guig0000r02n6399fb9h";

  try {
    const tournaments = await prisma.tournament.findMany({
      where: { userId: DUMMY_USER_ID },
      orderBy: { id: "desc" },
    });
    res.json(tournaments);
  } catch (err) {
    console.error("大会情報の取得に失敗しました:", err);
    res.status(500).json({ error: "Failed to fetch tournaments" });
  }
});

// 新しい試合結果を作成
router.post("/tournaments", async (req: Request, res: Response) => {
  try {
    const DUMMY_USER_ID = "cme14guig0000r02n6399fb9h";
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Tounament nam is required" });
    }
    const newTournament = await prisma.tournament.create({
      data: {
        name,
        userId: DUMMY_USER_ID,
      },
    });
    res.status(201).json(newTournament);
  } catch (err) {
    console.error("大会の作成に失敗しました:", err);
    res.status(500).json({ error: "Failed to create tournament" });
  }
});

// 試合結果を削除
router.delete("/tournaments/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.tournament.delete({ where: { id } });
    res.status(200).json({ message: `大会(ID: ${id})を削除しました。` });
  } catch (err) {
    console.error("大会の削除に失敗しました:", err);
    res.status(500).json({ error: "Failed to delete tournament" });
  }
});

export default router;
