import { Request, Response } from 'express';
import { loremIpsum } from 'lorem-ipsum';

export const mainController = {

  home(req: Request, res: Response) {
    res.send('Servidor funcionando!');
  },

  about(req: Request, res: Response) {
    res.render('about', {
      title: 'Sobre o SpitSnake'
    });
  },

  lorem(req: Request, res: Response) {
    const countParam = Array.isArray(req.params.count) ? req.params.count[0] : req.params.count;
    const count = parseInt(countParam, 10);

    if (isNaN(count) || count <= 0) {
      res.status(400).send('Informe um número inteiro positivo na URL. Ex: /lorem/5');
      return;
    }

    const html = loremIpsum({
      count,
      units: 'paragraphs',
      format: 'html'
    });

    res.send(html);
  },

  hb1(req: Request, res: Response) {
    res.render('hb1', {
      title: 'HB1 - Variável',
      playerName: 'Suyara',
      highScore: 1200
    });
  },

  hb2(req: Request, res: Response) {
    res.render('hb2', {
      title: 'HB2 - If',
      isLoggedIn: true   // troque pra false e teste de novo, pra ver o #else
    });
  },

  hb3(req: Request, res: Response) {
    res.render('hb3', {
      title: 'HB3 - Each',
      maps: [
        { name: 'Floresta', difficulty: 'Inicial' },
        { name: 'Lago', difficulty: 'Fácil' },
        { name: 'Montanha', difficulty: 'Médio' },
        { name: 'Sombras', difficulty: 'Difícil' },
        { name: 'Vulcão', difficulty: 'Extremo' }
      ]
    });
  },

  hb4(req: Request, res: Response) {
    const technologies = [
      { name: 'Express', type: 'Framework', poweredByNodejs: true },
      { name: 'Laravel', type: 'Framework', poweredByNodejs: false },
      { name: 'React', type: 'Library', poweredByNodejs: true },
      { name: 'Handlebars', type: 'Engine View', poweredByNodejs: true },
      { name: 'Django', type: 'Framework', poweredByNodejs: false },
      { name: 'Docker', type: 'Virtualization', poweredByNodejs: false },
      { name: 'Sequelize', type: 'ORM tool', poweredByNodejs: true },
    ];

    res.render('hb4', { title: 'HB4 - Helper', technologies });
  }

};