import { cleanEnv, port, str, url } from 'envalid';

export function validateEnv() {
  return cleanEnv(process.env, {
    PORT: port({ default: 3000 }),
    LOGS_PATH: str(),
    DATABASE_URL: url(),
  });
}