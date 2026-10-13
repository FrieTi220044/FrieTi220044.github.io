# Portfolio

Astro portfolio with a handheld-style arcade and a project inspector. Atlas is the featured project; the personal introduction and remaining projects are placeholders.

## Develop, build, test

```sh
bun install
bun run dev
bun run build
bun run preview
bun test
```

The existing GitHub Pages workflow deploys on pushes to `main`. The configured domain remains `https://frisi.net`.

## Edit content

- `src/data/profile.ts`: optional public name and introduction. Empty fields preserve the current intro, as requested.
- `src/data/projects.ts`: titles, descriptions, detailed explanations, images, alt text, tags, source/demo URLs. `screenshots` accepts an array of `{ src, alt }`. A single `image` is used when no gallery exists. Set `placeholder` to false for real projects.
- `src/data/contact.ts`: contact destinations. The contact panel shows an empty state until links are provided.
- `src/pages/index.astro`: page, cartridges, console, project templates, dialogs.
- `src/styles/portfolio.css`: design, responsive layouts, reduced-motion support.
- `src/scripts/portfolio.ts`: arcade controller, rendering, input, persistence, companion, and dialogs.
- `src/scripts/snake.ts` / `paddle.ts`: standalone game rules.
- `src/scripts/sound.ts`: optional Web Audio effects.

## Arcade

Choose Snake, Pong, or Breakout from the cartridges. Switching cartridges starts a new game; clicking the selected cartridge leaves its game intact. Each game and speed keeps a separate local high score, including the existing Snake record.

- **Snake:** arrows/WASD, swipes, or the direction pad. Eat food and avoid the walls and tail.
- **Pong:** left/right arrows, A/D, pointer movement or dragging, or hold the left/right direction buttons. Score seven points against the other paddle; three misses end the round.
- **Breakout:** the same paddle controls. Clear all 28 bricks with three lives.
- **All games:** Space pauses/resumes when the board is focused. Games pause when focus leaves the arcade, the board scrolls out of view, a dialog opens, or the browser loses focus. Resume explicitly to continue.

Select Lavender, Sage, or Sand and Easy, Normal, or Fast. Finish/speed preferences persist locally. Speed stays locked until the round ends or is reset. The pixel companion follows the game and reacts to scoring, losing, winning, and clicks.

Sound is muted on every page load. The Sound button creates/resumes audio only after a deliberate click. No audio files, network services, or game dependencies are required.

## Project inspector

Click or keyboard-activate a project row to open its inspector. It supports screenshot galleries, explanations, technology tags, source/demo links, and Previous/Next navigation. Escape closes the dialog and restores focus. Without JavaScript, the original expandable project previews remain usable.

`bun test` covers Snake and paddle collisions, input handling, scoring, lives, and win conditions. Browser verification covers all games, sound opt-in, persistence, inspector navigation, keyboard/direction controls, companion reactions, reduced motion, and layouts from 320px to 1440px.

Original unused starter components and content are retained; starter blog routes were removed.

## Atlas featured project

Atlas is the first, featured project. Its text describes the taxi fleet platform and identifies the author's contribution as mobile app development. Features and technologies were checked against `C:/thesis/atlas` at commit `6df6727`, including the mobile/automotive manuals, Android dependencies, main-screen workflows, and telemetry implementation. Repository: https://github.com/GameTec-live/atlas.

Atlas now includes the supplied five app screenshots and the official repository logo in `public/projects/atlas/`. The inspector preserves portrait proportions and offers thumbnails, previous/next controls, captions, and full-size image links. Add or reorder images using the `screenshots` array in `src/data/projects.ts`. Other project entries remain placeholders.
