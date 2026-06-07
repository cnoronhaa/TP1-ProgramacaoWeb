# SpitSnake - Programação Web

SpitSnake é um jogo de arena em que a cobra precisa sobreviver a ondas de inimigos, coletar maçãs, cuspir projéteis e derrotar chefes em mapas com dificuldade crescente.

## Tecnologias

- HTML5
- CSS3
- JavaScript ES6

## Estrutura
```text
game/
├── assets/
├── css/
├── js/
└── index.html
````
## Como executar

Abra a pasta `game` e execute `index.html` em um navegador moderno. Se o navegador bloquear módulos JavaScript por causa do caminho local, rode um servidor estático na pasta `Programacao web`:

```bash
python -m http.server 8080
```

Depois acesse `http://localhost:8080/game/`.

## Controles

- `WASD` ou setas: mover a cobra.
- `Espaco` ou clique na arena: cuspir veneno.
- `Esc`: pausar ou continuar.
- Menu de configurações: idioma `PT-BR`/`EN` e volume dos efeitos.

## Funcionalidades

- Estados de jogo: menu, seleção de mapa, jogando, pausado e fim de jogo;
- Movimentação, colisão, vida/HP, pontuação e aumento de dificuldade por fases;
- Cada mapa possui 10 rounds; a dificuldade aumenta a cada round e o chefão aparece no round 10;
- Inimigos diferentes por mapa, maçã vermelha (recupera vida), maçã dourada (recupera pouca vida, aumenta vida máx., aumenta dano e velocidade de movimentação) e recorde com `localStorage;
- Criação e remoção dinâmica de elementos na árvore DOM usando HTML, CSS e JavaScript puro.

## Integrantes

- Caroline Noronha
- Suyara Rodrigues

## Divisão de responsabilidades

- Caroline Noronha: lógica de gameplay, movimentação, colisão, pontuação, fases e inimigos.
- Suyara Rodrigues: interface, organização visual, assets, README e testes de uso.
