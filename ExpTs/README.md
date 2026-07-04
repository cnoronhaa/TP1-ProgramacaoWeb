# ExpTs - Programação Web (TP2)

Aplicação Web em Express + TypeScript que permite jogar o SpitSnake (jogo
desenvolvido na Parte 1), com sistema de contas, cursos e ranking de
pontuações, usando o ORM Prisma com banco de dados MySQL.

## Tecnologias

- Node.js + Express 5
- TypeScript
- Handlebars (express-handlebars)
- Prisma ORM + MySQL
- SASS
- bcryptjs (criptografia de senha)
- express-session (autenticação)

## Estrutura

```text
ExpTs/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   ├── css/
│   ├── js/
│   └── img/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── types/
│   ├── middlewares/
│   ├── router/
│   ├── utils/
│   └── views/
│       ├── layouts/
│       ├── major/
│       └── user/
├── .env.example
└── package.json
```

## Como executar

```bash
npm install
cp .env.example .env
```

Edite o `.env` preenchendo `DATABASE_URL` (conexão com seu MySQL local) e
`SESSION_SECRET`.

```bash
npx prisma migrate dev
npm start
```

Acesse `http://localhost:4000`.

## Funcionalidades

- Cadastro e login de usuários, com senha criptografada (bcrypt)
- CRUD de cursos (Major), com exclusão via modal de confirmação + Ajax
- Layout Handlebars compartilhado entre as páginas
- Estilização com SASS
- Jogo SpitSnake integrado, acessível apenas para usuários logados
- Ranking com as 10 maiores pontuações

## Integrantes

- Caroline Noronha
- Suyara Rodrigues

## Divisão de responsabilidades

| Exercício | Descrição | Responsável |
|---|---|---|
| #1–#8 | Setup Express+TS, About, .env/envalid, logger, router, /lorem, hb1–hb4 | Base seguindo os exercícios resolvidos em aula |
| #9 | Refatoração MVC | Suyara Rodrigues |
| #10 | Layout Handlebars | Suyara Rodrigues |
| #11 | SASS | Suyara Rodrigues |
| #12 | Prisma + MySQL | Suyara Rodrigues |
| #13 | CRUD de Major | Suyara Rodrigues |
| #14 | Modal de exclusão + Ajax | Suyara Rodrigues |
| #15 | Página de cadastro | Suyara Rodrigues |
| — | Login / sessão | Caroline Noronha |
| #16 | Jogo integrado na rota `/` + salvar score | Caroline Noronha |
| #17 | Página de Ranking | Caroline Noronha |
| #18 | Navbar dinâmica | Caroline Noronha |