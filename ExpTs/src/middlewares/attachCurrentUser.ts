import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export async function attachCurrentUser(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    res.locals.isLoggedIn = !!user;
    res.locals.currentUser = user;
  } else {
    res.locals.isLoggedIn = false;
    res.locals.currentUser = null;
  }

  next();
}