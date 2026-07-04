import { Request, Response } from 'express';
import { rankingService } from '../services/ranking.service';

export const rankingController = {

  async show(req: Request, res: Response) {
    const ranking = await rankingService.getTopScores(10);
    res.render('ranking', {
      title: 'Ranking',
      ranking
    });
  }

};