const mapFactor = {
  jungle: 1,
  water: 1.08,
  ice: 1.18,
  shadow: 1.3,
  fire: 1.45
};

function scaled(type, name, sprite, power, radius, world, ability = 'none') {
  const factor = mapFactor[world];
  return {
    type,
    name,
    sprite: `assets/images/${sprite}`,
    power,
    radius,
    speed: (108 + power * 11) * (1 + (factor - 1) * 0.35),
    hp: power * 10 * factor,
    damage: (2 + power * 1.22) * factor,
    points: power * 12,
    ability
  };
}

function fixed(type, name, sprite, power, radius, speed, hp, world, ability = 'none') {
  const factor = mapFactor[world];
  return {
    type,
    name,
    sprite: `assets/images/${sprite}`,
    power,
    radius,
    speed: 70 + speed * 24,
    hp,
    damage: (2 + power * 1.22) * factor,
    points: power * 12,
    ability
  };
}

export const PROJECTILE_SPRITES = {
  player: 'assets/images/player-spit.png',
  enemyWind: 'assets/images/jungle-wind.png',
  enemyBanana: 'assets/images/jungle-banana.png',
  enemyVenom: 'assets/images/snake-spit-jungle.png',
  enemyInk: 'assets/images/water-ink.png',
  enemySpike: 'assets/images/water-spike.png',
  enemyNut: 'assets/images/ice-nut.png',
  enemySnowball: 'assets/images/ice-snowball.png',
  enemyShadowVenom: 'assets/images/snake-spit-shadow.png',
  enemyShadowArrow: 'assets/images/shadow-arrow.png',
  enemyFireTornado: 'assets/images/fire-tornado.png',
  enemyDragonFire: 'assets/images/fireball.png',
  enemySerpentFire: 'assets/images/snake-spit-fire.png',
  enemyFireRock: 'assets/images/fire-rock.png',
  web: 'assets/images/jungle-web.png',
  iceWeb: 'assets/images/ice-web.png',
  shadowWeb: 'assets/images/shadow-web.png',
  miniMushroom: 'assets/images/jungle-mini-mushroom.png',
  shadowMiniMushroom: 'assets/images/shadow-mini-mushroom.png',
  fireLavaPool: 'assets/images/fire-lava-pool.png',
  fireMiniFlame: 'assets/images/fire-mini-flame.png'
};

export const MAPS = [
  {
    id: 1,
    key: 'jungle',
    name: 'Selva',
    difficulty: 'Inicial',
    background: 'assets/images/map-selva.png',
    projectile: PROJECTILE_SPRITES.player,
    bossType: 'redSnake',
    enemies: [
      scaled('ant', 'Formiga', 'jungle-ant.png', 1, 14, 'jungle'),
      scaled('macaw', 'Arara', 'jungle-macaw.png', 7, 23, 'jungle', 'enemyWind'),
      scaled('spider', 'Aranha', 'jungle-spider.png', 3, 22, 'jungle', 'web'),
      scaled('mushroom', 'Cogumelo', 'jungle-mushroom.png', 2, 20, 'jungle', 'miniMushroom'),
      scaled('bee', 'Abelha', 'jungle-bee.png', 3, 18, 'jungle'),
      scaled('monkey', 'Macaco', 'jungle-monkey.png', 7, 24, 'jungle', 'enemyBanana'),
      scaled('ocelot', 'Jaguatirica', 'jungle-ocelot.png', 6, 26, 'jungle'),
      scaled('redSnake', 'Cobra Vermelha', 'jungle-red-snake.png', 8, 23, 'jungle', 'enemyVenom'),
      scaled('rat', 'Rato', 'jungle-rat.png', 4, 19, 'jungle')
    ]
  },
  {
    id: 2,
    key: 'water',
    name: 'Água',
    difficulty: 'Fácil',
    background: 'assets/images/map-agua.png',
    projectile: PROJECTILE_SPRITES.player,
    bossType: 'seaSnake',
    enemies: [
      scaled('shrimp', 'Camarão', 'water-shrimp.png', 1, 14, 'water'),
      scaled('jellyfish', 'Água-viva', 'water-jellyfish.png', 6, 22, 'water'),
      scaled('crab', 'Caranguejo', 'water-crab.png', 3, 20, 'water'),
      scaled('seaSponge', 'Esponja', 'water-sponge.png', 2, 19, 'water'),
      scaled('seaUrchin', 'Ouriço', 'water-urchin.png', 3, 18, 'water', 'enemySpike'),
      scaled('turtle', 'Tartaruga', 'water-turtle.png', 4, 22, 'water'),
      scaled('shark', 'Tubarão', 'water-shark.png', 7, 28, 'water'),
      scaled('squid', 'Lula', 'water-squid.png', 6, 23, 'water', 'enemyInk'),
      scaled('seaSnake', 'Serpente Marinha', 'water-sea-snake.png', 8, 23, 'water', 'enemyVenom')
    ]
  },
  {
    id: 3,
    key: 'ice',
    name: 'Gelo',
    difficulty: 'Médio',
    background: 'assets/images/map-gelo.png',
    projectile: PROJECTILE_SPRITES.player,
    bossType: 'whiteSnake',
    enemies: [
      scaled('rabbit', 'Coelho', 'ice-rabbit.png', 1, 15, 'ice'),
      scaled('wolf', 'Lobo', 'ice-wolf.png', 6, 24, 'ice'),
      scaled('squirrel', 'Esquilo', 'ice-squirrel.png', 2, 16, 'ice', 'enemyNut'),
      scaled('whiteSpider', 'Aranha Branca', 'ice-white-spider.png', 5, 22, 'ice', 'iceWeb'),
      scaled('seal', 'Foca', 'ice-seal.png', 4, 22, 'ice'),
      scaled('penguin', 'Pinguim', 'ice-penguin.png', 3, 18, 'ice', 'enemySnowball'),
      scaled('polarBear', 'Urso Polar', 'ice-polar-bear.png', 7, 30, 'ice'),
      scaled('moose', 'Alce', 'ice-moose.png', 5, 27, 'ice'),
      scaled('whiteSnake', 'Cobra Branca', 'ice-white-snake.png', 8, 23, 'ice', 'enemyVenom')
    ]
  },
  {
    id: 4,
    key: 'shadow',
    name: 'Sombrio',
    difficulty: 'Difícil',
    background: 'assets/images/map-sombrio.png',
    projectile: PROJECTILE_SPRITES.player,
    bossType: 'shadowBlackMamba',
    enemies: [
      fixed('shadowCentipede', 'Centipeia Sombria', 'shadow-centipede.png', 1, 18, 4, 10, 'shadow'),
      { ...fixed('shadowSoul', 'Alma Sombria', 'shadow-soul.png', 2, 13, 5, 18, 'shadow'), summonOnly: true },
      fixed('shadowGhost', 'Fantasma', 'shadow-ghost.png', 3, 20, 3, 30, 'shadow', 'shadowSoul'),
      fixed('shadowBlackWidow', 'Viúva Negra', 'shadow-black-widow.png', 7, 23, 5, 70, 'shadow', 'shadowWeb'),
      fixed('shadowBat', 'Morcego', 'shadow-bat.png', 2, 18, 6, 20, 'shadow'),
      fixed('shadowZombie', 'Zumbi', 'shadow-zombie.png', 4, 23, 2, 40, 'shadow'),
      fixed('shadowPoisonMushroom', 'Cogumelo Venenoso', 'shadow-poison-mushroom.png', 5, 22, 4, 50, 'shadow', 'shadowMiniMushroom'),
      fixed('shadowSkeleton', 'Esqueleto', 'shadow-skeleton.png', 4, 20, 3, 40, 'shadow', 'enemyShadowArrow'),
      fixed('shadowScorpion', 'Escorpião', 'shadow-scorpion.png', 6, 23, 6, 60, 'shadow'),
      fixed('shadowBlackMamba', 'Mamba Negra', 'shadow-black-mamba.png', 8, 23, 6, 80, 'shadow', 'enemyShadowVenom')
    ]
  },
  {
    id: 5,
    key: 'fire',
    name: 'Fogo',
    difficulty: 'Extremo',
    background: 'assets/images/map-fogo.png',
    projectile: PROJECTILE_SPRITES.player,
    bossType: 'fireSerpent',
    enemies: [
      fixed('fireAnt', 'Formiga de Fogo', 'fire-ant.png', 1, 14, 5, 10, 'fire'),
      fixed('phoenix', 'Fênix', 'fire-phoenix.png', 6, 24, 7, 60, 'fire', 'enemyFireTornado'),
      fixed('fireCaterpillar', 'Lagarta de Fogo', 'fire-caterpillar.png', 2, 20, 5, 20, 'fire'),
      fixed('fireFrog', 'Sapo de Fogo', 'fire-frog.png', 3, 20, 3, 30, 'fire'),
      fixed('lavaCube', 'Cubo de Lava', 'fire-lava-cube.png', 4, 22, 4, 40, 'fire', 'fireLavaPool'),
      fixed('fireElemental', 'Elemental de Fogo', 'fire-elemental.png', 3, 19, 4, 30, 'fire', 'fireMiniFlame'),
      fixed('dragon', 'Dragão', 'fire-dragon.png', 7, 26, 7, 70, 'fire', 'enemyDragonFire'),
      fixed('golem', 'Golem', 'fire-golem.png', 6, 27, 2, 60, 'fire', 'enemyFireRock'),
      fixed('fireSerpent', 'Serpente de Fogo', 'fire-serpent.png', 8, 23, 6, 80, 'fire', 'enemySerpentFire')
    ]
  }
];

for (const map of MAPS) {
  map.boss = map.enemies.find((enemy) => enemy.type === map.bossType);
}

export const FOOD = {
  apple: { sprite: 'assets/images/food-apple.png', heal: 24, points: 10 },
  goldenApple: { sprite: 'assets/images/food-golden-apple.png', heal: 38, points: 35 }
};
