# MARS CITY

A browser-based, persistent 3D Mars civilization. The live city begins with one owner-approved founding event and The Genesis Core. A separate **demonstration** city contains 26 fictional questions, buildings, creatures, and chronology, accessible with the demo switch. Neither mode claims to have ingested the owner's past conversations.

## Explore

Vite + TypeScript + Three.js render a deterministic hexagonal settlement on displaced Martian terrain, with dunes, crater basins, rocks, atmospheric fog, a small sun and a continuously changing Sol day/night cycle. The Sol slider lets you inspect the blue sunset and neon night without waiting; the cycle can pause. Camera orientation toward the sunset sun reveals the blue horizon halo. The live founding district has a crystal spire and a permanent Genesis landmark. Six optional sample districts use crystal spires, observatories, residential domes, organic structures, industrial frames, and a signature landmark. Mouse drag / one-finger drag rotates; wheel / pinch zooms; right drag / two-finger drag pans. Select a building for its record; double-click to focus. Responsive mobile panels, statistics, an interactive category legend, a five-stop timeline, a cinematic orbit, bilingual Hebrew/English UI and RTL/LTR, light/dark/system themes, reduced motion and local settings are provided. The 15-category taxonomy is in `data/categories.json`.

## Architecture

1. Instinct is the *human-reviewed* intelligent interface, outside this repository. It decides whether an exchange is meaningful and prepares a city event. **No external conversation listener or automatic authorization exists.** The owner initially reviews city updates.
2. `data/events.json` is the append-only live city event ledger; `data/demo-events.json` and `data/demo-city-state.json` are isolated fictional sample records. `data/city-state.json` is the current rendered state and operational source of truth; `data/categories.json` is the stable category taxonomy. Git history provides recovery.
3. `src/world.ts` uses Three.js / WebGL to render stable geometry from IDs and stored coordinates, never randomizing persisted entities on reload. Quality settings adjust resolution and rock count. `src/model.ts` validates data and computes fictional population.
4. `src/main.ts` is the responsive application shell, labels, panels, settings, and historical snapshot controls.

## City events and updates

Example event:

```json
{"id":"q-2026-10-01-001","kind":"question","category":"TECHNOLOGY","subcategory":"AI_AGENTS","complexity":4,"importance":3,"occurredAt":"2026-10-01T12:00:00+03:00","summary":{"he":"למידה על סוכני AI","en":"Learning about AI agents"}}
```

One meaningful conversational request normally yields one event; acknowledgements do not. Complexity (1–5) reflects conceptual difficulty, not message length. Repeated topics expand their existing district and building; a new category opens a district. A concept milestone adds a permanent monument. Question milestones are 100, 250, 500, 1,000, 2,500, 5,000, 10,000, 25,000, 50,000. IDs must be unique. The demo generator script is a conservative convenience, **not** a substitute for owner review or editorial judgment:

```bash
node scripts/apply-event.mjs /path/to/reviewed-event.json
npm test && npm run build
git add data/city-state.json data/events.json
git commit -m "city: add reviewed event q-..."
git push
```

Commit data updates separately from code changes. Never replace or reset existing data. An event already in the log fails instead of duplicating. Use Git history to revert an accidental commit or restore the prior valid JSON. Validate and back up before major schema changes. Future schema changes require a migration preserving IDs and the event ledger.

## Development and deployment

```bash
npm ci
npm run dev
npm test
npm run build
```

Node 22 recommended. Main-branch pushes affecting app or data run the GitHub Actions test/build workflow and publish `dist/` to GitHub Pages. Enable Pages source **GitHub Actions** in repository settings if it has not been enabled. Vite's `base` is `/mars-city/`. No tokens or credentials are stored in the repository. A public repository means every city file is public. Live state and events must contain only abstract metadata: category, subcategory, complexity, question count and an abstract non-identifying summary. Never store private conversation text or identifying personal details there. The fictional demo summaries are safe to publish.

## What is still ahead

This is a first, reviewable milestone, not the complete long-term simulation: real conversation-to-event curation and approval, richer building histories, archival snapshots beyond the demo event timestamps, semantic category assignment, advanced pathfinding/LOD, sound design, and a real years-long history need later work. Sound is currently a saved preference with no audio engine. Labels are a compact list rather than pinned 3D callouts. The renderer caps pixel ratio but does not yet dynamically benchmark a handset. Historical snapshots use stored entity creation times, not exact prior values of growing buildings. Browser visual/device testing is still required before declaring full cross-device parity.
