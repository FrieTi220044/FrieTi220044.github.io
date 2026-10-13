# Portfolio

Astro portfolio with an interactive handheld-style Snake game and expandable project entries. Personal information and projects remain placeholders.

## Develop and build

```sh
bun install
bun run dev
bun run build
bun run preview
```

The existing GitHub Pages workflow deploys on pushes to `main`. The configured domain remains `https://frisi.net`.

## Edit content

- `src/data/projects.ts`: project titles, descriptions, images, alt text, technology tags, source/demo URLs. Set `placeholder` to false for real projects.
- `src/data/contact.ts`: contact destinations. The dialog displays an empty state until links are provided.
- `src/pages/index.astro`: page structure and console markup.
- `src/styles/portfolio.css`: visual design, responsive layout, reduced-motion support.
- `src/scripts/portfolio.ts`: game rendering, controls, high-score storage, contact dialog.
- `src/scripts/snake.ts`: standalone Snake rules.

## Snake

Click Play Snake, then use arrows or WASD. Space pauses/resumes while the board is focused. Touch users can swipe on the board or use the direction pad. The game pauses when focus leaves the console, the board scrolls out of view, or the browser loses focus. Best scores are stored locally when storage is available. No audio, external services, or game dependencies are required.

Run `bun test` for game-logic tests covering food, growth, collisions, input queuing, tail movement, and a full-board win.

Original unused starter components and content are retained; starter blog routes were removed.
