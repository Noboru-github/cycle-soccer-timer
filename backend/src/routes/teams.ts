import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// 全てのチームを取得
router.get("/teams", async (req: Request, res: Response) => {
  const DUMMY_USER_ID = "cme14guig0000r02n6399fb9h";

  try {
    const teams = await prisma.team.findMany({
      where: { userId: DUMMY_USER_ID },
      orderBy: { id: "desc" },
    });
    res.json(teams);
  } catch (err) {
    console.error("チームの取得に失敗しました:", err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// 新しいチームを作成
router.post("/teams", async (req: Request, res: Response) => {
  try {
    const DUMMY_USER_ID = "cme14guig0000r02n6399fb9h";
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Team name is required" });
    }
    const newTeam = await prisma.team.create({
      data: {
        name,
        userId: DUMMY_USER_ID,
      },
    });
    res.status(201).json(newTeam);
  } catch (err) {
    console.error("チームの作成に失敗しました:", err);
    res.status(500).json({ error: "Failed to create Team" });
  }
});

// チームを削除
router.delete("/teams/:id", async (req: Request, res: Response) => {
  const { id, name } = req.params;
  try {
    await prisma.team.delete({ where: { id } });
    res.status(200).json({ message: `チーム(${name})を削除しました。` });
  } catch (err) {
    console.error("チームの削除に失敗しました:", err);
    res.status(500).json({ error: "Failed to delete team" });
  }
});

export default router;
