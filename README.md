# GymJP

This template should help get you started developing with Vue 3 in Vite.

## Backend API

An Express backend is included to manage user accounts. It currently persists data to `backend/data/users.json` so it can run without any external database, and it is ready to be replaced by a real database adapter later (configure the `USER_STORE_PATH` environment variable to point to your own storage file while prototyping).

- Default admin account: `admin@example.com` / `Admin123!`
- Base URL: `http://localhost:4000`

### Run the backend

```sh
npm run server
```

Environment variables:

- `PORT` (default `4000`) – API port
- `USER_STORE_PATH` – optional path to the JSON user store (useful when you swap in a database-backed repository later)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` – override the bootstrapped admin account

API routes:

- `GET /api/health` – liveness check
- `GET /api/users` – list users (password hashes are never returned)
- `POST /api/users` – create a user with `{ email, name, password }`
- `POST /api/login` – validate credentials with `{ email, password }`

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
