# Gaming Hood V2

Independent Gaming Hood gaming website.

## Publishing games

The site uses a CMS-ready workflow:

- `admin/` — Decap CMS publishing interface
- `data/games/` — one JSON file per game
- `data/games.json` — generated index used by the frontend
- `scripts/build-game-index.py` — combines individual game files
- `.github/workflows/deploy.yml` — rebuilds the index and deploys GitHub Pages

**Admin → New Game → Publish → GitHub commit → automatic index build → GitHub Pages deployment.**

Authentication must be configured for the Decap GitHub backend before publishing. Never put a GitHub personal access token in client-side code.
