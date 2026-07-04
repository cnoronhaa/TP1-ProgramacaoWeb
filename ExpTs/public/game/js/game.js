import { saveScoreToServer } from './api.js';
import { clearArena, showOnly } from './dom.js?v=20260603b';
import { Enemy, FoodItem, Player, Projectile } from './entities.js?v=20260603b';
import { FOOD, MAPS, PROJECTILE_SPRITES } from './maps.js?v=20260603b';
import { getHighScore, getSettings, getUnlockedMapId, saveHighScore, saveSettings, saveUnlockedMapId } from './storage.js?v=20260603b';
import { circlesCollide, clamp, normalize, pick } from './utils.js?v=20260603b';

const TEXT = {
  ptBr: {
    play: 'Jogar',
    maps: 'Mapas',
    settings: 'Configurações',
    back: 'Voltar',
    resume: 'Continuar',
    restart: 'Reiniciar',
    menu: 'Menu',
    nextMap: 'Próximo mapa',
    playAgain: 'Jogar novamente',
    shoot: 'Cuspir',
    pause: 'Pausar',
    mapChoice: 'Escolha o mapa',
    locked: 'Bloqueado',
    record: 'Recorde',
    map: 'Mapa',
    round: 'Fase',
    score: 'Pontos',
    hp: 'HP',
    player: 'Player',
    maxHp: 'Vida máx.',
    power: 'Poder',
    damage: 'Dano',
    effects: 'Efeitos',
    noEffects: 'Nenhum',
    shield: 'Proteção',
    paused: 'Pausado',
    gameOver: 'Game Over',
    mapComplete: 'Parabéns!',
    gameOverDefault: 'Sua cobra foi derrotada.',
    finalScore: 'Pontuação',
    language: 'Idioma',
    volume: 'Volume',
    gameOverMessage: (round, map) => `Você chegou até a fase ${round} no mapa ${map}.`,
    mapCompleteMessage: (map) => `Você derrotou o chefão e concluiu o mapa ${map}.`,
    allMapsCompleteMessage: 'Parabéns por concluir todos os mapas! Agora todos estão desbloqueados para jogar.'
  },
  en: {
    play: 'Play',
    maps: 'Maps',
    settings: 'Settings',
    back: 'Back',
    resume: 'Resume',
    restart: 'Restart',
    menu: 'Menu',
    nextMap: 'Next map',
    playAgain: 'Play again',
    shoot: 'Spit',
    pause: 'Pause',
    mapChoice: 'Choose map',
    locked: 'Locked',
    record: 'Best',
    map: 'Map',
    round: 'Wave',
    score: 'Score',
    hp: 'HP',
    player: 'Player',
    maxHp: 'Max HP',
    power: 'Power',
    damage: 'Damage',
    effects: 'Effects',
    noEffects: 'None',
    shield: 'Shield',
    paused: 'Paused',
    gameOver: 'Game Over',
    mapComplete: 'Congratulations!',
    gameOverDefault: 'Your snake was defeated.',
    finalScore: 'Score',
    language: 'Language',
    volume: 'Volume',
    gameOverMessage: (round, map) => `You reached wave ${round} on ${map}.`,
    mapCompleteMessage: (map) => `You defeated the boss and completed ${map}.`,
    allMapsCompleteMessage: 'Congratulations for completing every map! All maps are now unlocked to play.'
  }
};

export class SpitSnakeWebGame {
  constructor(elements) {
    this.elements = elements;
    this.screens = elements.screens;
    this.map = MAPS[0];
    this.state = 'menu';
    this.keys = new Set();
    this.pointer = null;
    this.lastAim = { x: 1, y: 0 };
    this.lastTime = 0;
    this.rafId = 0;
    this.round = 1;
    this.score = 0;
    this.kills = 0;
    this.applesCollected = 0;
    this.highScore = getHighScore();
    this.unlockedMapId = getUnlockedMapId();
    this.settings = getSettings();
    this.settingsReturn = 'menu';
    this.enemies = [];
    this.projectiles = [];
    this.foods = [];
    this.player = null;
    this.spawnDelay = 0;
    this.mapCompleted = false;
    this.goldenApplesSpawned = 0;
    this.audioContext = null;
    this.statusEffects = {};
    this.bindEvents();
    this.renderMapList();
    this.applyLanguage();
    this.updateHighScoreText();
    this.show('menu');
  }

  bindEvents() {
    document.addEventListener('keydown', (event) => {
      this.keys.add(event.key.toLowerCase());
      if (event.key === 'Escape') this.togglePause();
      if (event.key === ' ' && this.state === 'playing') {
        event.preventDefault();
        this.shoot();
      }
    });

    document.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase());
    });

    this.elements.play.addEventListener('click', () => this.show('maps'));
    this.elements.settings.addEventListener('click', () => this.openSettings('menu'));
    this.elements.backMenu.addEventListener('click', () => this.show('menu'));
    this.elements.resume.addEventListener('click', () => this.resume());
    this.elements.restartPaused.addEventListener('click', () => this.start(this.map));
    this.elements.mapsPaused.addEventListener('click', () => this.show('maps'));
    this.elements.settingsPaused.addEventListener('click', () => this.openSettings('paused'));
    this.elements.menuPaused.addEventListener('click', () => this.show('menu'));
    this.elements.restart.addEventListener('click', () => this.start(this.map));
    this.elements.nextMap.addEventListener('click', () => {
      const map = this.nextMap();
      if (map) this.start(map);
    });
    this.elements.mapsGameOver.addEventListener('click', () => this.show('maps'));
    this.elements.menuGameOver.addEventListener('click', () => this.show('menu'));
    this.elements.backSettings.addEventListener('click', () => this.closeSettings());
    this.elements.languageSelect.addEventListener('change', () => {
      this.settings.language = this.elements.languageSelect.value;
      saveSettings(this.settings);
      this.applyLanguage();
    });
    this.elements.volumeRange.addEventListener('input', () => {
      this.settings.volume = Number(this.elements.volumeRange.value);
      saveSettings(this.settings);
      this.syncSettingsForm();
    });
    this.elements.touchShoot.addEventListener('click', () => this.shoot());
    this.elements.touchPause.addEventListener('click', () => this.pause());
    this.elements.mapList.addEventListener('click', (event) => {
      const card = event.target.closest('.map-card');
      if (!card || card.disabled) return;
      const map = MAPS.find((item) => item.id === Number(card.dataset.mapId));
      if (map) this.start(map);
    });

    this.elements.arena.addEventListener('pointermove', (event) => this.updatePointer(event));
    this.elements.arena.addEventListener('pointerdown', (event) => {
      this.updatePointer(event);
      if (this.state === 'playing') this.shoot();
    });
  }

  renderMapList() {
    this.elements.mapList.replaceChildren();
    MAPS.forEach((map) => {
      const locked = map.id > this.unlockedMapId;
      const button = document.createElement('button');
      button.className = `map-card ${locked ? 'is-locked' : ''}`;
      button.type = 'button';
      button.dataset.mapId = String(map.id);
      button.disabled = locked;
      button.setAttribute('aria-disabled', String(locked));
      button.style.backgroundImage = `linear-gradient(90deg, rgba(10, 18, 22, .78), rgba(10, 18, 22, .25)), url("${map.background}")`;
      button.innerHTML = `<strong>${map.name}</strong><span>${locked ? '' : this.localizedDifficulty(map)}</span>`;
      this.elements.mapList.appendChild(button);
    });
  }

  show(name) {
    this.state = name;
    showOnly(this.screens, name);
    if (name !== 'playing') cancelAnimationFrame(this.rafId);
    if (name === 'settings') this.syncSettingsForm();
    this.updateHighScoreText();
  }

  openSettings(returnTo) {
    this.settingsReturn = returnTo;
    this.show('settings');
  }

  closeSettings() {
    if (this.settingsReturn === 'paused' && this.player) {
      this.show('paused');
      return;
    }
    this.show('menu');
  }

  syncSettingsForm() {
    this.elements.languageSelect.value = this.settings.language || 'ptBr';
    this.elements.volumeRange.value = String(this.settings.volume ?? 45);
    this.elements.volumeValue.textContent = `${this.settings.volume ?? 45}%`;
  }

  text() {
    return TEXT[this.settings.language] || TEXT.ptBr;
  }

  localizedDifficulty(map) {
    if (this.settings.language !== 'en') return map.difficulty;
    return {
      Inicial: 'Starter',
      Fácil: 'Easy',
      Médio: 'Medium',
      Difícil: 'Hard',
      Extremo: 'Extreme'
    }[map.difficulty] || map.difficulty;
  }

  applyLanguage() {
    const text = this.text();
    document.documentElement.lang = this.settings.language === 'en' ? 'en' : 'pt-BR';
    this.elements.play.textContent = text.play;
    this.elements.settings.textContent = text.settings;
    this.elements.resume.textContent = text.resume;
    this.elements.restartPaused.textContent = text.restart;
    this.elements.mapsPaused.textContent = text.maps;
    this.elements.settingsPaused.textContent = text.settings;
    this.elements.menuPaused.textContent = text.menu;
    this.elements.restart.textContent = text.playAgain;
    this.elements.nextMap.textContent = text.nextMap;
    this.elements.mapsGameOver.textContent = text.maps;
    this.elements.menuGameOver.textContent = text.menu;
    this.elements.touchShoot.textContent = text.shoot;
    this.elements.touchPause.textContent = text.pause;
    this.elements.backSettings.textContent = text.back;
    this.elements.settingsTitle.textContent = text.settings;
    this.elements.languageLabel.textContent = text.language;
    this.elements.volumeLabel.childNodes[0].textContent = `${text.volume} `;
    this.elements.playerInfoTitle.textContent = text.player;
    this.elements.playerMaxHpLabel.textContent = text.maxHp;
    this.elements.playerPowerLabel.textContent = text.power;
    this.elements.playerDamageLabel.textContent = text.damage;
    this.elements.playerEffectsLabel.textContent = text.effects;
    document.querySelector('.panel-title h1').textContent = text.mapChoice;
    document.querySelectorAll('.record-box span').forEach((item) => {
      item.textContent = text.record;
    });
    document.querySelector('#screen-paused h1').textContent = text.paused;
    document.querySelector('#game-over-title').textContent = text.gameOver;
    document.querySelector('#game-over-message').textContent = text.gameOverDefault;
    document.querySelector('.final-score span').textContent = text.finalScore;
    this.renderMapList();
    this.updateHud();
  }

  start(map) {
    this.map = map;
    clearArena(this.elements.arena);
    this.elements.arena.style.backgroundImage = `linear-gradient(rgba(4, 11, 16, .22), rgba(4, 11, 16, .5)), url("${map.background}")`;
    this.round = 1;
    this.score = 0;
    this.kills = 0;
    this.applesCollected = 0;
    this.enemies = [];
    this.projectiles = [];
    this.foods = [];
    this.mapCompleted = false;
    this.goldenApplesSpawned = 0;
    this.statusEffects = {};
    this.player = new Player(map, this.getBounds());
    this.player.mount(this.elements.arena);
    this.spawnRound();
    this.show('playing');
    this.elements.arena.focus();
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  getBounds() {
    const rect = this.elements.arena.getBoundingClientRect();
    const width = rect.width || 1000;
    const height = rect.height || 620;
    const left = Math.max(34, width * 0.08);
    const right = width - Math.max(34, width * 0.08);
    const top = Math.max(74, height * 0.12);
    const bottom = height - Math.max(84, height * 0.12);
    return {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top
    };
  }

  loop(time) {
    if (this.state !== 'playing') return;
    const dt = Math.min(0.033, (time - this.lastTime) / 1000 || 0);
    this.lastTime = time;
    this.update(dt);
    this.render();
    this.rafId = requestAnimationFrame((next) => this.loop(next));
  }

  update(dt) {
    const bounds = this.getBounds();
    this.updateStatusEffects(dt);
    this.updatePlayer(dt, bounds);
    this.updateEnemies(dt, bounds);
    this.updateProjectiles(dt, bounds);
    this.updateFoods();
    this.updateNaturalFoods(dt);
    this.checkRoundProgress(dt);
    this.updateHud();
  }

  updatePlayer(dt, bounds) {
    const input = { x: 0, y: 0 };
    if (this.keys.has('arrowup') || this.keys.has('w')) input.y -= 1;
    if (this.keys.has('arrowdown') || this.keys.has('s')) input.y += 1;
    if (this.keys.has('arrowleft') || this.keys.has('a')) input.x -= 1;
    if (this.keys.has('arrowright') || this.keys.has('d')) input.x += 1;
    const baseSpeed = this.player.speed;
    if (this.statusEffects.slow > 0) this.player.speed *= 0.6;
    if (this.statusEffects.freeze > 0) this.player.speed = 0;
    this.player.update(dt, input, bounds);
    this.player.speed = baseSpeed;
  }

  updateEnemies(dt, bounds) {
    this.enemies.forEach((enemy) => {
      enemy.update(dt, this.player, bounds, this.enemies);
      if (enemy.canShoot() && enemy.shootTimer <= 0) {
        this.useEnemyAbility(enemy);
        enemy.resetShootTimer();
      }
      if (circlesCollide(this.player, enemy) && this.player.hitCooldown <= 0) {
        const damage = enemyTouchDamage(enemy);
        const effectApplied = this.applyTouchEffect(enemy.type);
        if (damage > 0 || effectApplied) {
          this.player.hitCooldown = 0.9;
          if (damage > 0) this.damagePlayer(damage);
        }
      }
    });
  }

  updateProjectiles(dt, bounds) {
    this.projectiles.forEach((projectile) => projectile.update(dt));

    this.projectiles.slice().forEach((projectile) => {
      const outside = projectile.life <= 0 ||
        projectile.x < bounds.left - 120 || projectile.x > bounds.right + 120 ||
        projectile.y < bounds.top - 120 || projectile.y > bounds.bottom + 120;

      if (outside) {
        this.removeProjectile(projectile);
        return;
      }

      if (projectile.owner === 'player') {
        const enemy = this.enemies.find((target) => circlesCollide(projectile, target));
        if (enemy) {
          enemy.hp -= projectile.damage;
          this.removeProjectile(projectile);
          if (enemy.hp <= 0) this.defeatEnemy(enemy);
        }
      } else if (circlesCollide(projectile, this.player)) {
        this.applyProjectileEffect(projectile.owner);
        this.damagePlayer(projectile.damage);
        this.removeProjectile(projectile);
      }
    });
  }

  updateFoods() {
    this.foods.slice().forEach((food) => {
      if (!circlesCollide(food, this.player)) return;
      if (food.type === 'goldenApple') {
        const scale = 1 + (this.round - 1) * 0.08 + (this.map.id - 1) * 0.1;
        this.player.maxHp += Math.round(10 * scale);
        this.player.damage += Math.round(5 * scale);
        this.player.speed += Math.round(7 * scale);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.round(food.definition.heal * scale));
      } else {
        if (this.player.hp >= this.player.maxHp) return;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + food.definition.heal);
      }
      this.applesCollected += 1;
      this.score += food.definition.points;
      this.playSound('food');
      this.removeFood(food);
    });
  }

  updateNaturalFoods(dt) {
    const regularAppleCount = this.foods.filter((food) => food.type === 'apple').length;
    const maxRegularApples = this.round === 10 ? 2 : 1;
    if (regularAppleCount >= maxRegularApples) return;

    const mapPressure = 1 + (this.map.id - 1) * 0.08;
    const roundPressure = 1 + (this.round - 1) * 0.05;
    const chance = dt * 0.012 * mapPressure * roundPressure;
    if (Math.random() < chance) this.spawnFood('apple');
  }

  checkRoundProgress(dt) {
    if (this.enemies.length > 0) return;
    if (this.round >= 10) {
      this.completeMap();
      return;
    }
    this.spawnDelay -= dt;
    if (this.spawnDelay > 0) return;
    this.round += 1;
    this.maybeSpawnGoldenApple();
    this.spawnRound();
  }

  maybeSpawnGoldenApple() {
    if (this.goldenApplesSpawned >= 2) return;
    if (this.round !== 5 && this.round !== 10) return;
    this.spawnFood('goldenApple');
    this.goldenApplesSpawned += 1;
  }

  spawnRound() {
    const bounds = this.getBounds();
    const isBossRound = this.round === 10;
    const count = isBossRound ? 1 : Math.min(2 + Math.floor(this.round / 2), 6);
    const allowed = this.allowedEnemiesForRound(this.round);
    const spawned = [];
    for (let i = 0; i < count; i += 1) {
      const enemyDef = isBossRound ? this.map.boss : pick(allowed);
      const enemy = new Enemy(enemyDef, this.round, bounds, isBossRound);
      enemy.mount(this.elements.arena);
      this.enemies.push(enemy);
      spawned.push(enemy);
    }
    if (!isBossRound && spawned.length > 0 && spawned.every((enemy) => (
      !enemyChasesPlayer(enemy.type) && !enemyKeepsDistance(enemy.type)
    ))) {
      spawned[0].forceChase = true;
    }
    this.spawnDelay = 1.2;
  }

  allowedEnemiesForRound(round) {
    const maxPower = this.maxEnemyPowerForRound(round);
    return this.map.enemies.filter((enemy) => (
      !enemy.summonOnly && enemy.type !== this.map.bossType && enemy.power <= maxPower
    ));
  }

  maxEnemyPowerForRound(round) {
    if (round <= 1) return 2;
    if (round === 2) return 3;
    if (round === 3) return 4;
    if (round === 4) return 5;
    if (round === 5) return 6;
    if (round <= 7) return 7;
    return 8;
  }

  spawnFood(type, position = null) {
    const food = new FoodItem(type, FOOD[type], this.getBounds());
    if (position) {
      const bounds = this.getBounds();
      food.x = clamp(position.x, bounds.left + 70, bounds.right - 70);
      food.y = clamp(position.y, bounds.top + 80, bounds.bottom - 70);
    }
    food.mount(this.elements.arena);
    this.foods.push(food);
  }

  shoot() {
    if (this.state !== 'playing' || this.player.cooldown > 0) return;
    let direction = this.lastAim;
    if (this.pointer) {
      direction = normalize(this.pointer.x - this.player.x, this.pointer.y - this.player.y);
      this.lastAim = direction;
    }
    const projectile = new Projectile({
      x: this.player.x + direction.x * this.player.radius,
      y: this.player.y + direction.y * this.player.radius,
      direction,
      damage: this.player.damage,
      owner: 'player',
      sprite: this.map.projectile,
      rotationOffset: projectileRotationOffset('player')
    });
    projectile.mount(this.elements.arena);
    this.projectiles.push(projectile);
    this.player.cooldown = 0.22;
    this.playSound('shoot');
  }

  useEnemyAbility(enemy) {
    const ability = enemy.ability === 'none' && enemy.boss ? enemy.definition.ability : enemy.ability;
    if (ability === 'none') return;
    if (ability === 'shadowSoul') {
      this.spawnShadowSouls(enemy);
      return;
    }
    if (['web', 'iceWeb', 'shadowWeb', 'miniMushroom', 'shadowMiniMushroom', 'enemySpike', 'fireLavaPool', 'fireMiniFlame'].includes(ability)) {
      this.dropTrap(enemy, ability);
      return;
    }
    this.enemyShoot(enemy, ability);
  }

  enemyShoot(enemy, owner) {
    const direction = normalize(this.player.x - enemy.x, this.player.y - enemy.y);
    const projectileData = projectileStats(owner);
    const projectile = new Projectile({
      x: enemy.x + direction.x * enemy.radius,
      y: enemy.y + direction.y * enemy.radius,
      direction,
      damage: enemy.damage * projectileData.damageScale,
      owner,
      sprite: this.projectileSprite(owner),
      speed: projectileData.speed,
      radius: projectileData.radius,
      life: projectileData.life,
      rotationOffset: projectileRotationOffset(owner)
    });
    projectile.mount(this.elements.arena);
    this.projectiles.push(projectile);
  }

  dropTrap(enemy, owner) {
    const away = normalize(enemy.x - this.player.x, enemy.y - this.player.y);
    const projectileData = projectileStats(owner);
    const trap = new Projectile({
      x: enemy.x + away.x * (enemy.radius + 12),
      y: enemy.y + away.y * (enemy.radius + 12),
      direction: { x: 0, y: 0 },
      damage: enemy.damage * projectileData.damageScale,
      owner,
      sprite: this.projectileSprite(owner),
      speed: 0,
      radius: projectileData.radius,
      life: projectileData.life,
      rotationOffset: 0
    });
    trap.mount(this.elements.arena);
    this.projectiles.push(trap);
  }

  spawnShadowSouls(enemy) {
    const soulDef = this.map.enemies.find((item) => item.type === 'shadowSoul');
    if (!soulDef) return;
    const bounds = this.getBounds();
    for (const offset of [-44, 44]) {
      const soul = new Enemy(soulDef, this.round, bounds, false);
      soul.x = enemy.x + offset;
      soul.y = enemy.y + 30;
      soul.mount(this.elements.arena);
      this.enemies.push(soul);
    }
  }

  projectileSprite(owner) {
    if (owner === 'enemyVenom') {
      return {
        1: 'assets/images/snake-spit-jungle.png',
        2: 'assets/images/snake-spit-water.png',
        3: 'assets/images/snake-spit-ice.png',
        4: 'assets/images/snake-spit-shadow.png',
        5: 'assets/images/snake-spit-fire.png'
      }[this.map.id];
    }
    return PROJECTILE_SPRITES[owner] || PROJECTILE_SPRITES.enemyBanana;
  }

  applyProjectileEffect(owner) {
    if (['web', 'iceWeb', 'shadowWeb'].includes(owner)) this.statusEffects.slow = owner === 'web' ? 1.8 : 5;
    if (owner === 'enemySnowball') this.statusEffects.freeze = 4;
    if (['enemyVenom', 'enemyShadowVenom', 'shadowMiniMushroom'].includes(owner)) this.statusEffects.poison = owner === 'enemyShadowVenom' ? 3 : 2;
    if (['enemyDragonFire', 'enemySerpentFire', 'fireLavaPool', 'fireMiniFlame'].includes(owner)) this.statusEffects.burn = owner === 'enemySerpentFire' ? 6 : 5;
    if (owner === 'enemySpike') this.statusEffects.puncture = 5;
  }

  applyTouchEffect(type) {
    if (['bee', 'whiteSpider', 'shadowBlackWidow', 'shadowPoisonMushroom', 'shadowScorpion', 'fireFrog'].includes(type)) {
      this.statusEffects.poison = Math.max(this.statusEffects.poison || 0, type === 'shadowScorpion' ? 4 : 3);
      return true;
    }
    if (['jellyfish', 'fireCaterpillar', 'fireElemental'].includes(type)) {
      this.statusEffects.burn = Math.max(this.statusEffects.burn || 0, type === 'jellyfish' ? 5 : 3);
      return true;
    }
    if (type === 'seaUrchin') {
      this.statusEffects.puncture = Math.max(this.statusEffects.puncture || 0, 5);
      return true;
    }
    return false;
  }

  updateStatusEffects(dt) {
    for (const key of Object.keys(this.statusEffects)) {
      this.statusEffects[key] = Math.max(0, this.statusEffects[key] - dt);
    }
    if ((this.statusEffects.poison > 0 || this.statusEffects.burn > 0 || this.statusEffects.puncture > 0) && this.player) {
      this.player.hp -= 5 * dt;
      if (this.player.hp <= 0) this.gameOver();
    }
  }

  defeatEnemy(enemy) {
    this.score += Math.round(enemy.points + this.round * 5);
    this.kills += 1;
    this.playSound('enemy');
    enemy.destroy();
    this.enemies = this.enemies.filter((item) => item !== enemy);
    if (Math.random() < appleDropChance(enemy, this.round, this.map.id)) {
      this.spawnFood('apple', { x: enemy.x, y: enemy.y });
    }
  }

  damagePlayer(amount) {
    this.player.hp -= amount;
    this.elements.arena.classList.add('is-hit');
    window.setTimeout(() => this.elements.arena.classList.remove('is-hit'), 90);
    this.playSound('hit');
    if (this.player.hp <= 0) this.gameOver();
  }

  gameOver() {
    this.highScore = saveHighScore(Math.round(this.score));
    saveScoreToServer(Math.round(this.score));
    this.elements.gameOverTitle.textContent = this.text().gameOver;
    this.elements.finalScore.textContent = Math.round(this.score);
    this.elements.gameOverMessage.textContent = this.text().gameOverMessage(this.round, this.map.name);
    this.elements.nextMap.hidden = true;
    this.show('gameOver');
  }

  completeMap() {
    if (this.mapCompleted) return;
    this.mapCompleted = true;
    this.score += 250 + this.map.id * 50;
    this.highScore = saveHighScore(Math.round(this.score));
    saveScoreToServer(Math.round(this.score));
    const next = this.nextMap();
    this.unlockedMapId = saveUnlockedMapId(next ? next.id : MAPS.length);
    this.renderMapList();
    this.elements.gameOverTitle.textContent = this.text().mapComplete;
    this.elements.finalScore.textContent = Math.round(this.score);
    this.elements.gameOverMessage.textContent = next
      ? this.text().mapCompleteMessage(this.map.name)
      : this.text().allMapsCompleteMessage;
    this.elements.nextMap.hidden = !next;
    this.show('gameOver');
  }

  nextMap() {
    return MAPS.find((map) => map.id === this.map.id + 1) || null;
  }

  playSound(type) {
    const volume = (this.settings.volume ?? 45) / 100;
    if (volume <= 0) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.audioContext ??= new AudioContextClass();
    const context = this.audioContext;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const frequencies = { shoot: 520, food: 760, enemy: 220, hit: 120 };
    oscillator.frequency.value = frequencies[type] || 440;
    oscillator.type = type === 'hit' ? 'sawtooth' : 'sine';
    gain.gain.setValueAtTime(volume * 0.05, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
  }

  pause() {
    if (this.state === 'playing') this.show('paused');
  }

  resume() {
    if (!this.player) return;
    this.show('playing');
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  togglePause() {
    if (this.state === 'playing') this.pause();
    else if (this.state === 'paused') this.resume();
  }

  updatePointer(event) {
    const rect = this.elements.arena.getBoundingClientRect();
    this.pointer = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    if (this.player) this.lastAim = normalize(this.pointer.x - this.player.x, this.pointer.y - this.player.y);
  }

  removeProjectile(projectile) {
    projectile.destroy();
    this.projectiles = this.projectiles.filter((item) => item !== projectile);
  }

  removeFood(food) {
    food.destroy();
    this.foods = this.foods.filter((item) => item !== food);
  }

  render() {
    this.player.render();
    this.enemies.forEach((enemy) => enemy.render());
    this.projectiles.forEach((projectile) => projectile.render());
    this.foods.forEach((food) => food.render());
  }

  updateHud() {
    if (!this.player) return;
    const text = this.text();
    this.elements.hudMap.textContent = this.map.name;
    this.elements.hudRound.textContent = this.round;
    this.elements.hudScore.textContent = Math.round(this.score);
    this.elements.hudHighScore.textContent = Math.max(this.highScore, Math.round(this.score));
    this.elements.hudHp.textContent = Math.max(0, Math.ceil(this.player.hp));
    this.elements.hudMap.parentElement.firstChild.textContent = `${text.map} `;
    this.elements.hudRound.parentElement.firstChild.textContent = `${text.round} `;
    this.elements.hudScore.parentElement.firstChild.textContent = `${text.score} `;
    this.elements.hudHighScore.parentElement.firstChild.textContent = `${text.record} `;
    this.elements.hudHp.parentElement.firstChild.textContent = `${text.hp} `;
    this.updatePlayerInfo();
  }

  updatePlayerInfo() {
    if (!this.player) return;
    const text = this.text();
    const activeEffects = [];
    const badgeEffects = [];
    if (this.player.hitCooldown > 0) activeEffects.push(text.shield);
    if (this.statusEffects.slow > 0) {
      activeEffects.push(this.settings.language === 'en' ? 'Slow' : 'Lentidão');
      badgeEffects.push('slow');
    }
    if (this.statusEffects.freeze > 0) {
      activeEffects.push(this.settings.language === 'en' ? 'Frozen' : 'Congelado');
      badgeEffects.push('freeze');
    }
    if (this.statusEffects.poison > 0) {
      activeEffects.push(this.settings.language === 'en' ? 'Poison' : 'Veneno');
      badgeEffects.push('poison');
    }
    if (this.statusEffects.burn > 0) {
      activeEffects.push(this.settings.language === 'en' ? 'Burn' : 'Queimadura');
      badgeEffects.push('burn');
    }
    if (this.statusEffects.puncture > 0) {
      activeEffects.push(this.settings.language === 'en' ? 'Spikes' : 'Espinhos');
      badgeEffects.push('puncture');
    }
    this.elements.playerMaxHp.textContent = Math.round(this.player.maxHp);
    this.elements.playerPower.textContent = 1 + this.applesCollected;
    this.elements.playerDamage.textContent = Math.round(this.player.damage);
    this.elements.playerEffects.textContent = activeEffects.length > 0
      ? activeEffects.join(', ')
      : text.noEffects;
    this.player.setStatusBadges(badgeEffects);
  }

  updateHighScoreText() {
    this.highScore = getHighScore();
    this.elements.mapHighScore.textContent = this.highScore;
    this.elements.hudHighScore.textContent = this.highScore;
  }
}

function projectileStats(owner) {
  return {
    enemyWind: { speed: 480, radius: 13, damageScale: 1, life: 3.2 },
    enemyBanana: { speed: 430, radius: 14, damageScale: 1, life: 3.2 },
    enemyVenom: { speed: 430, radius: 11, damageScale: 1, life: 3.2 },
    enemyInk: { speed: 390, radius: 15, damageScale: 1, life: 3.2 },
    enemySpike: { speed: 0, radius: 18, damageScale: 0.65, life: 5 },
    enemyNut: { speed: 360, radius: 10, damageScale: 1, life: 3.2 },
    enemySnowball: { speed: 360, radius: 12, damageScale: 1, life: 3.2 },
    enemyShadowVenom: { speed: 430, radius: 11, damageScale: 1, life: 3.2 },
    enemyShadowArrow: { speed: 460, radius: 12, damageScale: 1, life: 3.2 },
    enemyFireTornado: { speed: 500, radius: 18, damageScale: 1, life: 3.2 },
    enemyDragonFire: { speed: 460, radius: 15, damageScale: 1, life: 3.2 },
    enemySerpentFire: { speed: 430, radius: 13, damageScale: 1, life: 3.2 },
    enemyFireRock: { speed: 360, radius: 16, damageScale: 1, life: 3.2 },
    web: { speed: 0, radius: 26, damageScale: 0, life: 5 },
    iceWeb: { speed: 0, radius: 26, damageScale: 0, life: 6 },
    shadowWeb: { speed: 0, radius: 26, damageScale: 0, life: 6 },
    miniMushroom: { speed: 0, radius: 15, damageScale: 1, life: 5 },
    shadowMiniMushroom: { speed: 0, radius: 15, damageScale: 0.6, life: 5 },
    fireLavaPool: { speed: 0, radius: 24, damageScale: 0.6, life: 5 },
    fireMiniFlame: { speed: 0, radius: 16, damageScale: 0.55, life: 5 }
  }[owner] || { speed: 360, radius: 12, damageScale: 1, life: 3.2 };
}

function projectileRotationOffset(owner) {
  return [
    'player',
    'enemyVenom',
    'enemyShadowVenom',
    'enemyDragonFire',
    'enemySerpentFire'
  ].includes(owner) ? Math.PI : 0;
}

function enemyChasesPlayer(type) {
  return [
    'bee', 'ocelot', 'redSnake', 'jellyfish', 'shark', 'seaSnake',
    'wolf', 'polarBear', 'whiteSnake', 'shadowBlackWidow', 'shadowZombie',
    'shadowScorpion', 'shadowBlackMamba', 'shadowSoul', 'fireCaterpillar',
    'fireSerpent'
  ].includes(type);
}

function enemyKeepsDistance(type) {
  return [
    'macaw', 'monkey', 'squid', 'squirrel', 'penguin', 'shadowSkeleton',
    'phoenix', 'dragon', 'golem'
  ].includes(type);
}

function enemyTouchDamage(enemy) {
  const scaleByType = {
    bee: 0.65,
    jellyfish: 0.45,
    seaUrchin: 0.45,
    whiteSpider: 0.35,
    shadowBlackWidow: 0.35,
    shadowPoisonMushroom: 0.35,
    shadowScorpion: 0.55,
    fireCaterpillar: 0.45,
    fireFrog: 0.45,
    fireElemental: 0.45
  };
  if (scaleByType[enemy.type]) return enemy.damage * scaleByType[enemy.type];
  if (enemyKeepsDistance(enemy.type) || enemy.type === 'mushroom') return 0;
  return enemy.damage;
}

function appleDropChance(enemy, round, mapId) {
  if (enemy.boss) return 0.82;
  return Math.min(0.46, 0.28 + round * 0.012 + mapId * 0.01);
}
