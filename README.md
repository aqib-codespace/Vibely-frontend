<div align="center">

# Vibely

**A social platform for sharing posts, chatting in real time, watching videos and buying and selling in a built-in marketplace.**

[![Live demo](https://img.shields.io/badge/Live_demo-vibely--lake.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vibely-lake.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-764ABC?style=flat-square&logo=redux&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)

[Backend repo](https://github.com/aqib-codespace/vibely-backend)

</div>

---

## Overview

Vibely is a full social network I designed and built from my own idea. This repository is the web app; it talks to the [Vibely API](https://github.com/aqib-codespace/vibely-backend) over REST and Socket.IO.

## Features

**Social**
- News feed with infinite scroll, likes and reactions
- Rich-text posts with **@mentions** (TipTap editor), emoji picker and up to 4 photos or videos per post
- Profiles with posts, photos, friends and saved videos
- Friend requests and friends list
- Share posts to other platforms

**Real-time chat**
- One-to-one messaging over Socket.IO with typing indicators and read receipts
- Edit, delete and react to messages, send media, search conversations
- Custom chat wallpapers

**Videos**
- Watch feed with likes and saved videos

**Marketplace**
- Browse listings and manage your own products
- AI-written product descriptions with Google Gemini
- Built-in buyer–seller chat for every listing

**Everything else**
- Live notifications with a dropdown and full notifications page
- Global search across people, posts, videos and marketplace items
- Sign up, sign in, email verification, OTP and password reset flows
- Account settings and light / dark theme

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 15 (App Router, Turbopack), React 19 |
| State | Redux Toolkit, redux-persist |
| Real time | socket.io-client |
| Data | Axios with separate public and authenticated clients |
| Forms | React Hook Form, Zod |
| Editor | TipTap with mentions |
| UI | Tailwind CSS, Radix UI, rizzui, Framer Motion, Lucide icons |
| AI | Google Gemini |
| Hosting | Vercel |

## Project structure

```
src/
├── app/
│   ├── (routes)/       # Pages: feed, profile, chat, friends, watch-videos, marketplace, notifications, auth
│   ├── api/            # Axios wrappers per feature (auth, feed, chat, friends, videos, marketplace, search)
│   ├── auth/           # Sign-in, sign-up, verification and password-reset forms
│   └── layout/         # Header, sidebar, mobile navigation, chat layout
├── modules/            # Feature UIs: feed, chat, friends, marketplace, profile settings, watch videos
├── components/         # Shared UI: post card, reactions, notifications, global search, TipTap editor
├── store/              # Redux slices (auth, chat) and store setup
├── contexts/           # Socket and notification providers
├── services/           # Socket.IO client
└── config/             # Axios clients
```

## Getting started

**Requirements:** Node.js 18+ and a running [Vibely API](https://github.com/aqib-codespace/vibely-backend).

```bash
git clone https://github.com/aqib-codespace/Vibely-frontend.git
cd Vibely-frontend
npm install
```

Create a `.env.local` file in the project root:

```bash
# REST API base URL
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:4000/api/v1
# Socket.IO server URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
# Optional: enables AI product descriptions in the marketplace
NEXT_PUBLIC_GEMINI_API_KEY=
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

## Troubleshooting

- **Keeps redirecting to `/signin`:** the route guard in `src/components/AuthWrapper.js` needs a `token` in `localStorage`. Sign in again and check that `NEXT_PUBLIC_BACKEND_BASE_URL` points at the running API.
- **401 errors:** the authenticated Axios client clears the token and redirects to sign-in on a 401. Check that the API accepts the token and allows your frontend origin in CORS.
- **Chat not updating live:** check that `NEXT_PUBLIC_API_BASE_URL` points at the Socket.IO server without the `/api/v1` suffix.

## Author

Built by **Muhammad Aqib**, full-stack and automation engineer.

[Portfolio](https://aqib-portfolio-mern.vercel.app) · [LinkedIn](https://www.linkedin.com/in/aqib-engineer2/) · [GitHub](https://github.com/aqib-codespace)
