# ፮ኪሎ ግቢ ጉባኤ — 6 Kilo Gibi Gubae

Public website and admin portal for the 6 Kilo Gibi Gubae student fellowship
(Addis Ababa University). The public site introduces the fellowship (English /
Amharic); the admin portal manages member registrations, admins and roles.

Live: <https://6kilogbigubae.vercel.app>

**Stack:** React 18, TypeScript, Vite, Tailwind CSS, Redux Toolkit, React Router,
i18next, Recharts. Talks to the [Gbi Gubae API](../Gbi_backend) backend.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:5173
```

In development, requests to `/api` are proxied to `http://localhost:5500`
(the backend's default port). Point it elsewhere with `VITE_DEV_API_PROXY`,
e.g. `VITE_DEV_API_PROXY=https://6kilogbigubaebackend.vercel.app npm run dev`.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint |
| `npm test` | Unit & component tests (Vitest + Testing Library) |

## How the frontend reaches the API

The app calls **`/api` on its own origin**. On Vercel, `vercel.json` rewrites
`/api/*` to the backend deployment, so the httpOnly session cookie is
first-party and works in every browser (including Safari, which blocks
third-party cookies).

> If the backend URL changes, update the `destination` of the `/api/:path*`
> rewrite in `vercel.json`.

To call a backend on a different origin directly instead, set `VITE_API_URL`
at build time (the backend must then allow that origin in `FRONTEND_URL`).

## Project layout

```
src/
  api/            axios client, error messages, global 401 handling
  app/store.ts    Redux store
  features/       Redux slices: auth, users, admins, roles
  service/        typed API helpers
  pages/          route pages (landing, login, admin/*, superAdmin/*)
  components/     UI: landing sections, admin forms/tables, modals, ui/*
  customhook/     useGetCurrentUser (session restore), useDebounce
  locales/        en / am translations
  types/          shared TypeScript types
```

## Routes

| Path | Access |
| --- | --- |
| `/` | Public landing page |
| `/admin/login` | Admin login |
| `/admin` | Dashboard (any admin) |
| `/admin/users` | Member management (actions depend on permissions) |
| `/admin/analytics` | Charts over the members the admin can see |
| `/admin/superadmin` | Admin management (super admins) |
| `/admin/manageRoles` | Role management (super admins) |

## Deploying to Vercel

1. Import the repository (framework preset: **Vite**). No environment variables
   are required.
2. Make sure the `/api/:path*` rewrite in `vercel.json` points at the backend.
3. Deploy.
