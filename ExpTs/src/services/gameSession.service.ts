import { prisma } from '../lib/prisma';

export const gameSessionService = {

  create(userId: string, score: number) {
    return prisma.gameSession.create({
      data: { userId, score }
    });
  }

};