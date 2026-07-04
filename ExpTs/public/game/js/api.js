export async function saveScoreToServer(score) {
  try {
    await fetch('/api/game-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score })
    });
  } catch (err) {
    console.error('Não foi possível salvar a pontuação no servidor:', err);
  }
}