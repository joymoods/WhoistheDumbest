# Web Quizshow

Ein schlankes Fullstack-Projekt für eine Quizrunde mit Freunden. Frontend (React/Vite/Tailwind) und Backend (Fastify + Socket.IO) laufen in separaten Containern, bereitgestellt über Docker und Nginx.

## Entwicklung

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

## Tests

```bash
cd backend
npm test
```

## Docker

```bash
cp .env.example .env
npm run compose:up
# Anwendung unter http://localhost erreichbar
npm run compose:down
```
