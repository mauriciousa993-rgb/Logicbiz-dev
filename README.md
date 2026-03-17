This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Proyectos (persistencia)

La lista de proyectos se sirve desde `GET /api/projects` y el panel admin usa `POST/PUT/DELETE /api/projects`.

El API intenta persistir en este orden:

0. (Opcional) Forzar almacenamiento: `PROJECTS_STORAGE=local` (archivo) o `PROJECTS_STORAGE=auto` (default).

1. **Upstash Redis REST** (recomendado para producción): `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (+ `UPSTASH_PROJECTS_KEY` opcional).
   - Si usas **Vercel KV**, también funciona con `KV_REST_API_URL` + `KV_REST_API_TOKEN`.
2. **Archivo JSON**: `PROJECTS_JSON_PATH` (opcional). Si no se define:
   - Local/dev: `.data/projects.json`
   - En Vercel (sin Upstash): `/tmp/logicbiz-projects.json` (mejor esfuerzo; no garantiza persistencia entre despliegues/cold starts).

Si Upstash/KV está configurado, el API por defecto **no hace fallback silencioso** a archivo/memoria (para evitar “desapariciones” intermitentes). Para permitir fallback, define `PROJECTS_ALLOW_FALLBACK=1`.

Para depurar el modo en uso, `GET /api/projects` devuelve el header `X-Projects-Storage` (`upstash`, `file`, `tmp` o `memory`) y el panel admin lo muestra arriba.

Smoke check rápido: `scripts/smoke-projects-api.sh`.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
