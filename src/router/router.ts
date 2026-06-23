import express from 'express';
import { loremIpsum } from 'lorem-ipsum';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Servidor funcionando!');
});

router.get('/about', (req, res) => {
  res.render('about', {
    title: 'Sobre o SpitSnake'
  });
});

router.get('/lorem/:count', (req, res) => {
  const count = parseInt(req.params.count, 10);

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
});

router.get('/hb1', (req, res) => {
  res.render('hb1', {
    playerName: 'Suyara',
    highScore: 1200
  });
});

router.get('/hb2', (req, res) => {
  res.render('hb2', {
    isLoggedIn: true   // troque pra false e teste de novo, pra ver o #else
  });
});

router.get('/hb3', (req, res) => {
  res.render('hb3', {
    maps: [
      { name: 'Floresta', difficulty: 'Inicial' },
      { name: 'Lago', difficulty: 'Fácil' },
      { name: 'Montanha', difficulty: 'Médio' },
      { name: 'Sombras', difficulty: 'Difícil' },
      { name: 'Vulcão', difficulty: 'Extremo' }
    ]
  });
});

router.get('/hb4', (req, res) => {
  const technologies = [
    { name: 'Express', type: 'Framework', poweredByNodejs: true },
    { name: 'Laravel', type: 'Framework', poweredByNodejs: false },
    { name: 'React', type: 'Library', poweredByNodejs: true },
    { name: 'Handlebars', type: 'Engine View', poweredByNodejs: true },
    { name: 'Django', type: 'Framework', poweredByNodejs: false },
    { name: 'Docker', type: 'Virtualization', poweredByNodejs: false },
    { name: 'Sequelize', type: 'ORM tool', poweredByNodejs: true },
  ];

  res.render('hb4', { technologies });
});

export default router;