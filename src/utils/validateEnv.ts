import { cleanEnv, port, str } from 'envalid';

export function validateEnv() {
  return cleanEnv(process.env, {
    PORT: port({ default: 3000 }),
    LOGS_PATH: str(),
  });
}