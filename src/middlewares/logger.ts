import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

type LogFormat = 'simples' | 'completo';

export function logger(format: LogFormat = 'simples') {
  return (req: Request, res: Response, next: NextFunction) => {
    const logsPath = path.resolve(process.env.LOGS_PATH!);
    const dataAcesso = new Date().toISOString();

    let linha = `[${dataAcesso}] ${req.method} ${req.originalUrl}`;

    if (format === 'completo') {
      linha += ` HTTP/${req.httpVersion} "${req.headers['user-agent']}"`;
    }

    linha += '\n';

    fs.appendFile(logsPath, linha, (err) => {
      if (err) console.error('Erro ao escrever no log:', err);
    });

    next();
  };
}