import { prisma } from '../lib/prisma';

export const rankingService = {

  async getTopScores(limit = 10) {
    const grouped = await prisma.gameSession.groupBy({
      by: ['userId'],
      _max: { score: true },
      orderBy: { _max: { score: 'desc' } },
      take: limit
    });

    const userIds = grouped.map((g: (typeof grouped)[number]) => g.userId);

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } }
    });

    const usersById = new Map(users.map((u: (typeof users)[number]) => [u.id, u]));

    return grouped.map((g: (typeof grouped)[number]) => ({
      user: usersById.get(g.userId),
      score: g._max.score
    }));
  }

};