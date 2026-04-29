# Stack Research

**Domain:** Podcast Player App with Statistics Tracking
**Researched:** 2026-04-29
**Confidence:** MEDIUM-HIGH
## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|---------------|
| **Next. js** | 15.x | Full-stack React framework | Industry standard for podcast apps (used by Podverse, Podfriend). App Router provides persistent player layout across routes—player never unmounts during navigation. SSR enables SEO-friendly podcast pages while preserving client-side audio state. Vercel deployment with generous free tier. |
| **TypeScript** | 5.x | Type safety | Required for maintainable codebase. Strong typing for audio player state, RSS feed schemas, statistics models. |
### Audio Playback
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|---------------|
| **howler. js** | 2.3.x | Cross-browser audio | The standard for web audio (3.3M+ weekly downloads). Web Audio API with HTML5 fallback. Supports streaming (critical for podcast episodes). Spatial audio, sprites, fade, rate control. Active maintenance, used in production by major apps. |
| **react- howler** | 5.2.x | React wrapper | Provides idiomatic React component API for howler. js. Integrates with component lifecycle. For advanced control, access underlying Howl via `player` escape hatch. |
### RSS Feed Parsing
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|---------------|
| **feedsmith** | 2.9.x | All-in-one feed parser | Built on fast- xml-parser. Supports RSS 2.0, iTunes tags, Podcasting 2.0 namespaces, Podlove chapters. TypeScript from ground up. Tree-shakable, ultra-fast parsing. Handles malformed feeds gracefully. |
| **fast- xml-parser** | 5.x | XML parsing | The JavaScript standard for XML parsing. Used by feedsmith, podcast- xml-parser, and most Node feed parsers. 30K+ stars, actively maintained, handles large feeds (tested 100MB+). |
### Database & ORM
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|---------------|
| **SQLite** (local) | via better- sqlite3 | Embedded database | Zero setup, file-based, perfect for single-user podcast app. Stores statistics, subscriptions, playback positions locally. No server required. |
| **Prisma** | 7.x | Type-safe ORM | The standard for TypeScript database access. Generates typed client from schema. Works with SQLite, PostgreSQL, Turso. Migrations, type inference. Prisma 7 uses libSQL adapter for SQLite. |
### State Management
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|---------------|
| **Zustand** | 5.x | Lightweight global state | Modern standard for React state. ~1.2KB vs Redux's ~19KB. Hook-based API, no Provider wrapper needed. Fine-grained subscriptions prevent unnecessary re- renders. Perfect for audio player state (high-frequency updates). 46% adoption in React Native ecosystem. |
### Statistics & Visualization
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|---------------|
| **Recharts** | 2.x | Charting library | The React standard for charts. Composable, responsive, TypeScript. Used by Podstats, Tesla Order Tracker. Supports line charts for time-series listening data, bar charts for podcast comparisons, pie charts for distribution. |
| **date- fns** | 4.x | Date utilities | Lightweight date manipulation for grouping statistics by day/week/month/year. Tree- shakable, TypeScript. |
### UI Components
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|---------------|
| **Tailwind CSS** | 4.x | Utility-first CSS | Industry standard with Next. js. Responsive design, dark mode, consistent spacing. shadcn/ ui components build on it. |
| **shadcn/ ui** | latest | Component library | Accessible, customizable components. Copy- paste ownership (not npm dependency). Built on Radix UI + Tailwind. Includes audio player UI patterns. |
### Offline & Storage
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|---------------|
| **IndexedDB** | via idb | Local storage | For episode downloads, offline playback. idb provides Promise- based IndexedDB API. Stores audio files locally for offline listening. |
| **Service Worker** | native | Background sync | PWA offline support. Download episodes in background. Background refresh of subscriptions. |
## Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| **Vite** | Build tooling | If not using Next. js, Vite is the standard. Fast HMR, ESM. |
| **Playwright** | E2E testing | Cross-browser testing for audio player functionality. |
| **Vitest** | Unit testing | Fast unit tests for statistics calculations. |
## Installation
```bash
# Core framework
npx create- next-app@latest podcast-stats --typescript --tailwind --eslint --app --src- dir
# Audio playback
npm install howler react- howler
# RSS parsing
npm install feedsmith fast- xml-parser
# Database
npm install prisma @prisma/ client better- sqlite3 @prisma/ adapter-better- sqlite3
npx prisma init --datasource- provider sqlite
# State management
npm install zustand
# Charts & dates
npm install recharts date- fns
# UI
npm install tailwindcss @tailwindcss/ vite
npx shadcn@latest init
# Local storage
npm install idb
# PWA
npm install next- pwa
```
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|---------------------|
| Next. js | **Tauri** | If building native desktop app with Rust backend. Bundle size ~3MB vs Next. js web. Requires Rust expertise. Mobile support still maturing. |
| Next. js | **Electron** | If VS Code- level complexity needed. 150MB bundle size, 300MB RAM. Massive ecosystem. Better for browser extension compatibility. |
| Next. js | **Flutter** | If native mobile UI is priority. Excellent performance, truly native controls. Requires learning Dart. |
| Zustand | **Redux Toolkit** | If complex async flows, time- travel debugging required, or 5+ developer team with established Redux patterns. 10x bundle size. |
| SQLite | **PostgreSQL** | If multi- user sync or cloud hosting needed. Requires database server. |
| Recharts | **Chart. js** | If non- React or lighter weight. Less React-native integration. |
| feedsmith | **podcast- xml-parser** | If only need basic iTunes RSS parsing. Lighter weight, simpler API. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-----------|
| **react- ios- pwa** | Niche, limited support | Next. js PWA with next- pwa |
| **soundcloud- api** | Deprecated, OAuth required | Direct podcast RSS/audio URLs |
| **vanilla Redux** | Excessive boilerplate | Zustand or Redux Toolkit |
| **MongoDB** | Schema- less causes type issues | Prisma with SQLite/PostgreSQL |
| **Context API for audio** | Re- render issues on high-frequency state | Zustand store |
| **LocalStorage for audio files** | 5MB limit, sync issues | IndexedDB via idb |
## Stack Patterns by Variant
**If cross-platform (web + desktop):**
- Use **Next. js + Tauri** via web PWA deployed to Tauri
- Desktop wrapper provides native features, web provides core experience
**If mobile-first (iOS/Android):**
- Use **React Native** with Expo
- `expo-av` for audio
- Similar statistics layer (SQLite, Zustand)
**If statistics only (dashboard, no playback):**
- Skip audio libraries
- Focus on Recharts, data aggregation
- Use static JSON or API for data
## Version Compatibility
| Package | Compatible With | Notes |
|---------|---------------|-------|
| Next. js 15 | React 19, Node 20+ | App Router stable |
| Prisma 7 | better- sqlite3 11+, Node 18+ | libSQL adapter replaces old sqlite3 |
| howler. js 2.3 | All modern browsers | Web Audio + HTML5 fallback |
| Zustand 5 | React 18+, React Native | Middleware API stable |
| Recharts 2 | React 16+ | Nivo compatible |
## Sources
- **Podverse monorepo** — Production Next. js + tRPC + Prisma stack
  https://github.com/podverse/podverse
- **Anytime Podcast Player** — Flutter pattern reference
  https://github.com/amugofjava/anytime_ podcast_ player
- **Podcaster** — Android Native with Media3
  https://github.com/mr3y- the-programmer/Podcaster
- **Podstats** — Recharts + date- fns pattern
  https://github.com/jamesmontemagno/podstats
- **Next. js persistent player pattern**
  https://www.lukehertzler.com/blog/how- i-build-persistent-music-players
- **howler. js** — Official documentation
  https://howlerjs.com/
- **feedsmith** — Fast RSS parser
  https://github.com/macieklamberski/feedsmith
- **Cross-platform comparison**
  https://dev.to/ishaaan/building- cross-platform-apps
- **State management 2025** — Zustand vs Redux comparison
  https://betterstack.com/community/guides/scaling- nodejs/zustand- vs-redux
---
*Stack research for: Podcast Player App with Statistics Tracking*
*Researched: 2026-04-29*