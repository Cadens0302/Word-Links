# Word Links

Word Links is a SwiftUI/WebKit iPhone app and static website built from one shared web-game bundle.

## Project layout

- `Word Links.xcodeproj/` — Xcode project for the app, unit tests, and UI tests.
- `WordLinks/` — SwiftUI shell, native daily-puzzle cache, entitlements, and app resources.
- `WordLinks/WordLinks.bundle/` — canonical web-game source used by the app and website.
- `publication/website/dist/` — GitHub Pages staging output and daily JSON files.
- `tools/sync-wordlinks-bundle.mjs` — synchronizes the canonical bundle into website output (`publication/website/dist/` locally or root `dist/` in the GitHub checkout).
- `tools/verify-website.mjs` — validates website assets and daily schedules.

Build the `Word Links` scheme in Xcode. Before website verification or publishing, run:

```sh
node tools/sync-wordlinks-bundle.mjs
node tools/verify-website.mjs
```

The app and website currently use device/browser-local progress. Accounts and cloud sync are not implemented.
