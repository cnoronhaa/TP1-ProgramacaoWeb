import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const authController = {

  loginForm(req: Request, res: Response) {
    res.render('auth/login', {
      title: 'Login'
    });
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await authService.validateCredentials(email, password);

    if (!user) {
      res.status(401).render('auth/login', {
        title: 'Login',
        error: 'Email ou senha inválidos.',
        email
      });
      return;
    }

    req.session.userId = user.id;
    res.redirect('/');
  },

  logout(req: Request, res: Response) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }

};