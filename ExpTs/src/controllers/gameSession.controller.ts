import { Request, Response } from 'express';
import { gameSessionService } from '../services/gameSession.service';

export const gameSessionController = {

  async save(req: Request, res: Response) {
    const userId = req.session.userId as string;
    const parsedScore = Number(req.body.score);

    if (!Number.isFinite(parsedScore) || parsedScore < 0) {
      res.status(400).json({ error: 'Score inválido.' });
      return;
    }

    await gameSessionService.create(userId, Math.round(parsedScore));
    res.status(201).json({ success: true });
  }

};