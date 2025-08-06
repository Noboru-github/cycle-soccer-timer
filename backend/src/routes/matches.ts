import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// 全ての試合結果を取得
router.get("/matches", async (req: Request, res: Response) => {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { playedAt: "desc" },
      include: { homeTeam: true, awayTeam: true },
    });
    res.json(matches);
  } catch (err) {
    console.error("試合結果の取得に失敗しました:", err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

// 新しい試合結果を作成
router.post("/matches", async (req: Request, res: Response) => {
  try {
    const { homeScore, awayScore, homeTeamId, awayTeamId, tournamentId } =
      req.body;
    const newMatch = await prisma.match.create({
      data: {
        homeScore,
        awayScore,
        homeTeamId,
        awayTeamId,
        tournamentId,
      },
    });
    res.status(201).json(newMatch);
  } catch (err) {
    console.error("試合結果の作成に失敗しました:", err);
    res.status(500).json({ error: "Failed to create match" });
  }
});

// 試合結果を削除
router.delete("/matches/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.match.delete({ where: { id } });
    res.status(200).json({ message: `試合(ID: ${id})を削除しました。` });
  } catch (err) {
    console.error("試合の削除に失敗しました:", err);
    res.status(500).json({ error: "Failed to delete match" });
  }
});

export default router;
