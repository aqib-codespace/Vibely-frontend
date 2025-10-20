# Vibely (social-frontend)

Vibely is a modern social media frontend built with Next.js (App Router), React 19 and Tailwind CSS. This repository contains the web client that connects to a REST API backend and provides features like feed, posts, real-time chat (Socket.IO), notifications, a marketplace, and AI-powered helpers.

This README explains how to set up the project locally, important environment variables, available scripts, and where to find major pieces of the codebase.

## Key facts

- Tech: Next.js 15 (App Router), React 19, Tailwind CSS, Redux Toolkit, Socket.IO client
- Styling: Tailwind CSS + custom globals
- State: Redux Toolkit + redux-persist
- HTTP: Axios (separate public/private clients)
- Real-time: socket.io-client
- Other notable libraries: TipTap editor, rizzui (UI bits), react-hot-toast, react-slick

## Requirements

- Node.js (recommended 18.x or later)
- npm (or your preferred package manager)

Note: The repository uses Next's turbopack for dev/build by default via the scripts in `package.json`.

## Quick start (development)

Open a PowerShell terminal in the project root and run:

```powershell
npm install
npm run dev
```

This will start Next.js in development mode (turbopack). Visit http://localhost:3000.

## Build & production

Build the production assets and start the server:

```powershell
npm run build
npm run start
```

The app expects the backend API to be available and configured via environment variables (see next section).

## Environment variables

The project reads a few environment variables in various places. Common ones to configure:

- API_BASE_URL — (server-side / config) Base URL of the backend API used by `src/config/request.ts` (example: `http://localhost:4000/api/v1`). If not set, defaults to `http://localhost:4000/api/v1`.
- NEXT_PUBLIC_API_BASE_URL — (client-side) Base URL used by socket services and other client utilities when connecting to the backend (example: `http://localhost:4000`).
- NEXT_PUBLIC_GEMINI_API_KEY — API key used by AI-related helpers (if marketplace product-generation features are used).

Create a `.env.local` in the project root for local development. Example:

```text
API_BASE_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_GEMINI_API_KEY=
```

Notes:
- Use `API_BASE_URL` for server or universal Axios config. Use `NEXT_PUBLIC_API_BASE_URL` when a client-exposed value is required (sockets, client-only requests).
- Keep any real API keys or secrets out of the repository and never commit `.env.local`.

## Important scripts

Taken from `package.json`:

- `npm run dev` — start Next.js in development mode (uses turbopack)
- `npm run build` — build for production
- `npm run start` — start the production server after a build
- `npm run lint` — run eslint

## High-level project structure

- `src/app` — Next.js App Router entry; global layouts, pages (index), and app-level providers
- `src/components` — shared components (AuthWrapper, NotificationDropdown, PostCard, etc.)
- `src/modules` — feature modules (feed, chat, marketplace, watch-videos, profile, etc.)
- `src/app/api` — client API wrappers using axios (e.g., `feedApis.js`, `auth.js`)
- `src/store` — Redux Toolkit slices and store setup (authSlice, chatSlice)
- `src/contexts` — React contexts (SocketContext, NotificationContext)
- `src/config` — axios client configuration (`request.ts`)
- `public` — static assets such as wallpapers

## Authentication and routing

- `AuthWrapper` (in `src/components/AuthWrapper.js`) is a client-side route guard that redirects users to `/signin` if no `token` is present in `localStorage`. Public routes are defined there.
- On successful sign-in the app stores `token`, `refreshToken`, and `user` in `localStorage` and the Redux store (see `src/app/api/auth.js`).

## API & sockets

- HTTP requests use two axios clients in `src/config/request.ts`: `axiosPublicApi` and `axiosPrivateApi`. `axiosPrivateApi` appends the `Authorization` header from `localStorage`.
- Socket support is wired by `src/services/socket.js` and used by context providers. Sockets typically expect `NEXT_PUBLIC_API_BASE_URL`.

## Tests & linting

- There are no automated tests in the repository by default. Adding unit/integration tests is recommended.
- Linting is available via `npm run lint`. Ensure dependencies are installed before running lint.

## Troubleshooting

- If the app keeps redirecting to `/signin`:
	- Check `localStorage` for `token` and `user` entries. Auth guard uses these values.
	- Make sure `API_BASE_URL` matches your backend and that the backend is running.

- CORS / 401 errors:
	- The axios private client will remove the token and redirect to `/signin` on 401. Ensure your backend accepts the token and CORS is configured for the frontend origin.

- Socket connection problems:
	- Confirm `NEXT_PUBLIC_API_BASE_URL` is set and reachable. Check for port mismatches (api may run on a different port than socket server).

## Deployment notes

- When deploying, set the environment variables on your hosting platform (Vercel, Netlify, custom server).
- Vercel can deploy this Next.js app directly. Ensure `API_BASE_URL` and any public env vars are configured in the Vercel project settings.

## Contribution & next steps

- Add a `CONTRIBUTING.md` outlining contribution workflow and code style.
- Add tests (Jest/React Testing Library) for core components and Redux slices.
- Add an `env.example` file with required environment variables.
- Consider adding CI (GitHub Actions) to run lint and tests on PRs.

## License

This repository does not contain a LICENSE file. Add one if you intend to publish under an open-source license.

---

If you want, I can also:

- add an `.env.example` file with the vars shown above
- create a simple GitHub Actions workflow to run lint on PRs
- add a CONTRIBUTING.md template

Tell me which of the follow-ups you'd like me to do next.

