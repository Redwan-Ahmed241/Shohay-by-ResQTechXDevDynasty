# Shohay (সহায়) — Frontend

React 19 + TypeScript + Vite web app for Shohay, a flood-relief coordination platform for
Bangladesh. It talks to the FastAPI backend in the `Shohoy-Backend` repository and uses
Supabase Auth for sign-in (one-time codes by email or SMS — no passwords).

| Who | Pages |
|---|---|
| Anyone (no account) | Home + request tracker, Alerts, Shelters, Get Help (request assistance), Campaigns, Contacts |
| Field volunteer | Sign In, Volunteer Registration, Volunteer Dashboard (tasks, duty clock, drone alerts) |
| District coordinator | Command Center (requests, dispatch, tasks, volunteers), Warehouse, UAV Monitor |

## Run it locally

```bash
npm install
npm run dev          # http://localhost:5173
```

Create `.env` from `.env.example`:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` for a local backend, or the deployed backend URL |
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon / publishable key (public by design) |

Without the Supabase key the public pages work, but nobody can sign in.

```bash
npm run build        # type-check + production build
npm run lint
```

## How sign-in works

1. The Sign In page asks Supabase to send a one-time code (`signInWithOtp`).
2. The user types the code (or taps the link in the email) → Supabase creates a session.
3. Every API call sends the Supabase access token (`src/services/api.ts`).
4. The backend verifies it and returns the user's role from its own database — the role is
   never decided in the browser. Coordinators are the emails listed in the backend's `ADMIN_EMAILS`.

Admin and volunteer pages are wrapped in `RequireRole` (`src/router.tsx`); the backend enforces
the same rules on every request.

## Code map

```
src/router.tsx              every page and who may open it
src/context/AuthContext.tsx the signed-in user (from the Supabase session)
src/services/               one file per backend area; all HTTP goes through api.ts
src/services/uavService.ts  drone monitoring (ResQTech FYDP module)
src/pages/                  one component + CSS per page
src/components/             layout (header/footer), UI pieces, RequireRole
src/types/index.ts          shared data shapes (match the backend responses)
```

Public pages fall back to built-in sample data only when the backend cannot be reached at all.
Anything that changes data (requests, tasks, stock, drones) never fakes success: errors are shown.
