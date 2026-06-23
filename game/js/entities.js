import { createSprite } from './dom.js?v=20260602c';
import { clamp, normalize, randomBetween, setElementPosition } from './utils.js?v=20260602c';

function turnToward(current, target, amount) {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + delta * amount;
}

export class Player {
  constructor(map, arena) {
    this.radius = 18;
    this.width = 56;
    this.height = 38;
    this.maxHp = 115;
    this.hp = this.maxHp;
    this.damage = 48;
    this.speed = 245;
    this.cooldown = 0;
    this.hitCooldown = 0;
    this.x = arena.left + arena.width / 2;
    this.y = arena.top + arena.height * 0.62;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.element = document.createElement('div');
    this.element.className = 'entity player css-snake';
    this.element.setAttribute('aria-label', 'Cobra SpitSnake');
    this.element.innerHTML = [
      '<span class="snake-neck"></span>',
      '<span class="snake-head"></span>',
      '<span class="snake-belly"></span>',
      '<span class="snake-eye eye-one"></span>',
      '<span class="snake-eye eye-two"></span>',
      '<span class="snake-pupil pupil-one"></span>',
      '<span class="snake-pupil pupil-two"></span>',
      '<span class="snake-mouth"></span>',
      '<span class="snake-tongue"></span>',
    ].join('');
    this.lifeBar = document.createElement('div');
    this.lifeBar.className = 'player-life-bar';
    this.lifeFill = document.createElement('span');
    this.lifeBar.appendChild(this.lifeFill);
    this.statusBar = document.createElement('div');
    this.statusBar.className = 'player-status-badges';
    this.statusBadgeKey = '';
    this.trailElements = Array.from({ length: 6 }, () => {
      const trail = document.createElement('div');
      trail.className = 'snake-trail';
      return trail;
    });
    this.segmentStates = this.trailElements.map((_, index) => ({
      x: this.x - Math.cos(this.angle) * (15 + index * 8),
      y: this.y - Math.sin(this.angle) * (15 + index * 8),
      angle: this.angle
    }));
  }

  mount(arenaElement) {
    this.trailElements.forEach((trail) => arenaElement.appendChild(trail));
    arenaElement.appendChild(this.statusBar);
    arenaElement.appendChild(this.lifeBar);
    arenaElement.appendChild(this.element);
  }

  update(dt, input, bounds) {
    const dir = normalize(input.x, input.y);
    const moving = Math.abs(input.x) + Math.abs(input.y) > 0;
    const targetVx = moving ? dir.x * this.speed : 0;
    const targetVy = moving ? dir.y * this.speed : 0;
    const blend = Math.min(1, dt * (moving ? 10 : 7));
    this.vx += (targetVx - this.vx) * blend;
    this.vy += (targetVy - this.vy) * blend;
    this.x = clamp(this.x + this.vx * dt, bounds.left + this.radius, bounds.right - this.radius);
    this.y = clamp(this.y + this.vy * dt, bounds.top + this.radius, bounds.bottom - this.radius);
    if (Math.hypot(this.vx, this.vy) > 8) {
      this.angle = turnToward(this.angle, Math.atan2(this.vy, this.vx), Math.min(1, dt * 9));
    }
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.hitCooldown = Math.max(0, this.hitCooldown - dt);
    this.updateSegments(dt);
  }

  updateSegments(dt) {
    let anchor = {
      x: this.x - Math.cos(this.angle) * 14,
      y: this.y - Math.sin(this.angle) * 14
    };
    this.segmentStates.forEach((segment, index) => {
      const distance = 8;
      const currentAngle = Math.atan2(anchor.y - segment.y, anchor.x - segment.x);
      const target = {
        x: anchor.x - Math.cos(currentAngle) * distance,
        y: anchor.y - Math.sin(currentAngle) * distance
      };
      const fallback = {
        x: this.x - Math.cos(this.angle) * (22 + index * distance),
        y: this.y - Math.sin(this.angle) * (22 + index * distance)
      };
      if (!Number.isFinite(segment.x) || !Number.isFinite(segment.y)) {
        segment.x = fallback.x;
        segment.y = fallback.y;
      }
      const blend = Math.min(1, dt * (14 - Math.min(index, 6)));
      segment.x += (target.x - segment.x) * blend;
      segment.y += (target.y - segment.y) * blend;
      segment.angle = Math.atan2(anchor.y - segment.y, anchor.x - segment.x);
      anchor = segment;
    });
  }

  render() {
    this.trailElements.forEach((element, index) => {
      const segment = this.segmentStates[index];
      const width = Math.max(12, 32 - index * 2.8);
      const height = Math.max(9, 22 - index * 1.8);
      element.style.width = `${width}px`;
      element.style.height = `${height}px`;
      element.style.opacity = `${0.84 - index * 0.055}`;
      element.style.transform = `translate(${segment.x - width / 2}px, ${segment.y - height / 2}px) rotate(${segment.angle}rad)`;
    });
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.transform = `translate(${this.x - this.width / 2}px, ${this.y - this.height / 2}px) rotate(${this.angle}rad)`;
    const barWidth = 68;
    const barHeight = 8;
    this.lifeBar.style.width = `${barWidth}px`;
    this.lifeBar.style.height = `${barHeight}px`;
    this.lifeBar.style.transform = `translate(${this.x - barWidth / 2}px, ${this.y - this.height / 2 - 15}px)`;
    this.lifeFill.style.width = `${Math.max(0, (this.hp / this.maxHp) * 100)}%`;
    this.statusBar.style.transform = `translate(${this.x - this.statusBar.offsetWidth / 2}px, ${this.y - this.height / 2 - 39}px)`;
  }

  setStatusBadges(badges) {
    const key = badges.join('|');
    if (key === this.statusBadgeKey) return;
    this.statusBadgeKey = key;
    this.statusBar.replaceChildren();
    badges.forEach((badge) => {
      const element = document.createElement('span');
      element.className = `status-badge ${badge}`;
      element.textContent = statusSymbol(badge);
      this.statusBar.appendChild(element);
    });
  }
}

function statusSymbol(kind) {
  return {
    slow: '~',
    burn: 'F',
    poison: 'V',
    freeze: '*',
    puncture: '!'
  }[kind] || '?';
}

export class Enemy {
  constructor(definition, round, bounds, boss = false) {
    const scale = boss ? 1.65 : 1;
    const edge = Math.floor(Math.random() * 4);
    const randomWalker = !boss && !chasesPlayer(definition.type) && !keepsDistance(definition.type);
    this.definition = definition;
    this.type = definition.type;
    this.kind = definition.kind || definition.ability || 'none';
    this.ability = definition.ability || 'none';
    this.power = boss ? 10 : definition.power;
    this.boss = boss;
    this.radius = definition.radius * scale;
    this.size = Math.max(34, definition.radius * (boss ? 4.7 : 3.2));
    this.maxHp = boss ? definition.hp * 4.2 : definition.hp + round * 0.8;
    this.hp = this.maxHp;
    this.damage = definition.damage * (boss ? 1.25 : 1);
    this.speed = definition.speed * (boss ? 0.72 : 0.58);
    this.points = definition.points * (boss ? 4 : 1);
    this.shootTimer = initialAbilityCooldown(this.ability);
    this.aiTimer = 0;
    this.wander = { x: 0, y: 0 };
    this.wanderTarget = randomArenaPoint(bounds, 120);
    this.vx = 0;
    this.vy = 0;
    this.forceChase = false;
    this.angle = 0;
    this.facing = 1;
    if (randomWalker) {
      this.x = randomBetween(bounds.left + 120, bounds.right - 120);
      this.y = randomBetween(bounds.top + 120, bounds.bottom - 120);
    } else {
      this.x = edge === 1 ? bounds.right + 50 : edge === 3 ? bounds.left - 50 : randomBetween(bounds.left + 50, bounds.right - 50);
      this.y = edge === 2 ? bounds.bottom + 50 : edge === 0 ? bounds.top - 50 : randomBetween(bounds.top + 50, bounds.bottom - 50);
    }
    this.element = createSprite(`entity enemy ${boss ? 'boss' : ''}`, definition.sprite, definition.name);
    this.image = this.element.querySelector('img');
    this.bossLabel = document.createElement('div');
    this.bossLabel.className = 'boss-label';
    this.bossLabel.textContent = 'CHEFÃO';
    this.bar = document.createElement('div');
    this.bar.className = 'life-bar';
    this.barFill = document.createElement('span');
    this.bar.appendChild(this.barFill);
    if (boss) this.element.appendChild(this.bossLabel);
    this.element.appendChild(this.bar);
  }

  mount(arenaElement) {
    arenaElement.appendChild(this.element);
  }

  update(dt, player, bounds, enemies = []) {
    this.aiTimer -= dt;
    if (this.aiTimer <= 0) {
      this.aiTimer = randomBetween(1.0, 2.4);
      this.wanderTarget = randomArenaPoint(bounds, 120);
    }
    const toPlayer = normalize(player.x - this.x, player.y - this.y);
    const distanceToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    let speed = this.speed;
    const keepDistance = keepsDistance(this.type);
    const chase = this.forceChase || chasesPlayer(this.type) || this.boss;
    if (this.ability === 'web' || this.ability === 'iceWeb' || this.ability === 'shadowWeb') speed *= 0.72;
    if (Math.hypot(this.wanderTarget.x - this.x, this.wanderTarget.y - this.y) < 48) {
      this.wanderTarget = randomArenaPoint(bounds, 120);
      this.aiTimer = randomBetween(0.8, 1.8);
    }
    this.wander = normalize(this.wanderTarget.x - this.x, this.wanderTarget.y - this.y);
    let direction = this.wander;
    if (chase) {
      direction = this.boss && distanceToPlayer < 230 ? { x: -toPlayer.x, y: -toPlayer.y } : toPlayer;
    } else if (keepDistance) {
      if (distanceToPlayer < 260) direction = { x: -toPlayer.x, y: -toPlayer.y };
      else if (distanceToPlayer > 430) direction = toPlayer;
      else direction = this.wander;
      direction = keepInsideArena(direction, this, bounds, toPlayer);
    }
    direction = avoidOtherEnemies(direction, this, enemies);
    direction = keepInsideArena(direction, this, bounds, toPlayer);
    this.vx += (direction.x * speed - this.vx) * Math.min(1, dt * (this.type === 'redSnake' ? 8.5 : 5.5));
    this.vy += (direction.y * speed - this.vy) * Math.min(1, dt * (this.type === 'redSnake' ? 8.5 : 5.5));
    this.x = clamp(this.x + this.vx * dt, bounds.left + this.radius, bounds.right - this.radius);
    this.y = clamp(this.y + this.vy * dt, bounds.top + this.radius, bounds.bottom - this.radius);
    this.angle = Math.atan2(this.vy, this.vx);
    if (Math.abs(this.vx) > 1.2) this.facing = this.vx >= 0 ? 1 : -1;
    this.shootTimer -= dt;
  }

  canShoot() {
    return this.ability !== 'none' || this.boss;
  }

  resetShootTimer() {
    this.shootTimer = nextAbilityCooldown(this.ability, this.boss);
  }

  render() {
    this.element.style.width = `${this.size}px`;
    this.element.style.height = `${this.size}px`;
    this.barFill.style.width = `${Math.max(0, (this.hp / this.maxHp) * 100)}%`;
    this.element.style.transform = `translate(${this.x - this.size / 2}px, ${this.y - this.size / 2}px)`;
    this.image.style.transform = `scaleX(${this.facing * (this.definition.spriteFacing ?? -1)})`;
  }

  destroy() {
    this.element.remove();
  }
}

export class Projectile {
  constructor({ x, y, direction, damage, owner, sprite, speed, radius, life, rotationOffset, slow = false }) {
    this.x = x;
    this.y = y;
    this.radius = radius ?? (owner === 'player' ? 12 : 14);
    this.size = this.radius * 2.4;
    const projectileSpeed = speed ?? (owner === 'player' ? 560 : 260);
    this.vx = direction.x * projectileSpeed;
    this.vy = direction.y * projectileSpeed;
    this.damage = damage;
    this.owner = owner;
    this.life = life ?? (owner === 'player' ? 0.9 : 3.2);
    this.slow = slow;
    this.angle = Math.atan2(direction.y, direction.x);
    this.rotationOffset = rotationOffset ?? 0;
    this.element = createSprite(`entity projectile ${owner}`, sprite, owner === 'player' ? 'Cuspe da cobra' : 'Ataque inimigo');
  }

  mount(arenaElement) {
    arenaElement.appendChild(this.element);
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }

  render() {
    this.element.style.width = `${this.size}px`;
    this.element.style.height = `${this.size}px`;
    setElementPosition(this.element, this.x, this.y, this.size, this.angle + this.rotationOffset);
  }

  destroy() {
    this.element.remove();
  }
}

function chasesPlayer(type) {
  return [
    'bee', 'ocelot', 'redSnake', 'jellyfish', 'shark', 'seaSnake',
    'wolf', 'polarBear', 'whiteSnake', 'shadowBlackWidow', 'shadowZombie',
    'shadowScorpion', 'shadowBlackMamba', 'shadowSoul', 'fireCaterpillar',
    'fireSerpent'
  ].includes(type);
}

function keepsDistance(type) {
  return [
    'macaw', 'monkey', 'squid', 'squirrel', 'penguin', 'shadowSkeleton',
    'phoenix', 'dragon', 'golem'
  ].includes(type);
}

function keepInsideArena(direction, enemy, bounds, toPlayer) {
  const margin = enemy.radius + 18;
  let x = direction.x;
  let y = direction.y;
  const nearLeft = enemy.x <= bounds.left + margin;
  const nearRight = enemy.x >= bounds.right - margin;
  const nearTop = enemy.y <= bounds.top + margin;
  const nearBottom = enemy.y >= bounds.bottom - margin;

  if (nearLeft && x < 0) x = 0.8;
  if (nearRight && x > 0) x = -0.8;
  if (nearTop && y < 0) y = 0.8;
  if (nearBottom && y > 0) y = -0.8;

  if ((nearLeft || nearRight || nearTop || nearBottom) && Math.abs(x) + Math.abs(y) < 0.2) {
    x = -toPlayer.y;
    y = toPlayer.x;
  }

  return normalize(x, y);
}

function randomArenaPoint(bounds, margin) {
  const safeX = Math.min(margin, bounds.width * 0.28);
  const safeY = Math.min(margin, bounds.height * 0.28);
  return {
    x: randomBetween(bounds.left + safeX, bounds.right - safeX),
    y: randomBetween(bounds.top + safeY, bounds.bottom - safeY)
  };
}

function avoidOtherEnemies(direction, enemy, enemies) {
  let x = direction.x;
  let y = direction.y;
  enemies.forEach((other) => {
    if (other === enemy) return;
    const distance = Math.hypot(enemy.x - other.x, enemy.y - other.y);
    if (distance <= 0 || distance >= 80) return;
    x += ((enemy.x - other.x) / distance) * 0.45;
    y += ((enemy.y - other.y) / distance) * 0.45;
  });
  return normalize(x, y);
}

function initialAbilityCooldown(ability) {
  if (['enemyVenom', 'enemyShadowVenom', 'enemySerpentFire'].includes(ability)) return 1.2;
  if (ability === 'shadowSoul') return 7;
  if (ability !== 'none') return 4;
  return 1.5;
}

function nextAbilityCooldown(ability, boss) {
  if (boss) return randomBetween(1.1, 1.7);
  if (['enemyVenom', 'enemyShadowVenom', 'enemySerpentFire'].includes(ability)) return randomBetween(1.4, 2.2);
  if (['enemyWind', 'enemyBanana', 'enemyShadowArrow', 'enemyFireTornado', 'enemyDragonFire', 'enemyFireRock'].includes(ability)) return randomBetween(2.2, 3.8);
  if (['enemyInk', 'enemyNut', 'enemySnowball'].includes(ability)) return randomBetween(3.0, 6.0);
  if (ability === 'shadowSoul') return 7;
  if (['web', 'iceWeb', 'shadowWeb', 'miniMushroom'].includes(ability)) return 15;
  if (['enemySpike', 'shadowMiniMushroom', 'fireLavaPool', 'fireMiniFlame'].includes(ability)) return randomBetween(2.0, 2.8);
  return randomBetween(1.5, 2.5);
}

export class FoodItem {
  constructor(type, definition, bounds) {
    this.type = type;
    this.definition = definition;
    this.radius = type === 'goldenApple' ? 24 : 20;
    this.size = type === 'goldenApple' ? 52 : 44;
    this.x = randomBetween(bounds.left + 70, bounds.right - 70);
    this.y = randomBetween(bounds.top + 80, bounds.bottom - 70);
    this.element = createSprite(`entity food ${type}`, definition.sprite, type === 'goldenApple' ? 'Maçã dourada' : 'Maçã');
  }

  mount(arenaElement) {
    arenaElement.appendChild(this.element);
  }

  render() {
    this.element.style.width = `${this.size}px`;
    this.element.style.height = `${this.size}px`;
    setElementPosition(this.element, this.x, this.y, this.size);
  }

  destroy() {
    this.element.remove();
  }
}
