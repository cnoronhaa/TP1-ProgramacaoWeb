import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { majorService } from '../services/major.service';

export const userController = {

  async signupForm(req: Request, res: Response) {
    const majors = await majorService.findAll();
    res.render('user/signup', {
      title: 'Criar Conta',
      majors
    });
  },

  async signup(req: Request, res: Response) {
    const { fullname, email, password, confirmPassword, majorId } = req.body;

    if (password !== confirmPassword) {
      const majors = await majorService.findAll();
      res.status(400).render('user/signup', {
        title: 'Criar Conta',
        majors,
        error: 'As senhas não coincidem.',
        fullname,
        email
      });
      return;
    }

    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      const majors = await majorService.findAll();
      res.status(400).render('user/signup', {
        title: 'Criar Conta',
        majors,
        error: 'Já existe uma conta com esse email.',
        fullname
      });
      return;
    }

    await userService.create({ fullname, email, password, majorId });

    // Login/sessão ainda será implementado; por enquanto volta pra home.
    res.redirect('/');
  }

};