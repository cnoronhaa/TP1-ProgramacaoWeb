import express from 'express';
import dotenv from 'dotenv';
import { engine } from 'express-handlebars';
import { SafeString } from 'handlebars';
import path from 'path';
import { validateEnv } from './utils/validateEnv';
import { logger } from './middlewares/logger';
import router from './router/router';

dotenv.config();
validateEnv();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger('completo'));

app.engine('handlebars', engine({
  defaultLayout: false,
  helpers: {
    listaPoweredByNodejs: (technologies: { name: string; type: string; poweredByNodejs: boolean }[]) => {
      const filtradas = technologies.filter((tech) => tech.poweredByNodejs);
      const itens = filtradas.map((tech) => `<li>${tech.name} (${tech.type})</li>`).join('');
      return new SafeString(`<ul>${itens}</ul>`);
    }
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(router);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});