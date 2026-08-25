# Gaming Hood Admin

The `admin/` folder contains the Decap CMS publishing interface.

## Publishing workflow

1. Open `/admin/` on the site.
2. Sign in through the configured GitHub OAuth helper.
3. Open **Games**.
4. Tap **New Game**.
5. Fill in the game information and upload/select the cover image.
6. Publish.

Decap creates one JSON file per game in `data/games/`. A GitHub Actions workflow rebuilds `data/games.json` automatically and deploys the updated site to GitHub Pages.

## Security

The GitHub backend requires server-side OAuth. The current configuration is prepared for Netlify's OAuth helper. Do not put a GitHub personal access token into client-side JavaScript or commit one to the repository.
