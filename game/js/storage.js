const HIGH_SCORE_KEY = 'spitsnake_web_high_score';
const SETTINGS_KEY = 'spitsnake_web_settings';
const UNLOCKED_MAP_KEY = 'spitsnake_web_unlocked_map';

export function getHighScore() {
  return Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
}

export function saveHighScore(score) {
  const current = getHighScore();
  if (score > current) {
    localStorage.setItem(HIGH_SCORE_KEY, String(score));
    return score;
  }
  return current;
}

export function getSettings() {
  try {
    return {
      language: 'ptBr',
      volume: 45,
      ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
    };
  } catch {
    return { language: 'ptBr', volume: 45 };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getUnlockedMapId() {
  return Math.max(1, Number(localStorage.getItem(UNLOCKED_MAP_KEY) || 1));
}

export function saveUnlockedMapId(mapId) {
  const unlocked = Math.max(getUnlockedMapId(), mapId);
  localStorage.setItem(UNLOCKED_MAP_KEY, String(unlocked));
  return unlocked;
}
