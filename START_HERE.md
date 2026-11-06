# Word Links — start here

This is the takeover guide for the next AI or developer. Read this file first, then read [XCODE_APP_CONTEXT.md](XCODE_APP_CONTEXT.md) before changing behavior. This same repository contains both the website and the Xcode app.

## Project identity

Word Links is an iPhone word-game app backed by a static web game bundle. It contains Word Links, a 15 × 15 word-connection game, and Mini Crossword, a 12 × 12 crossword game. It also includes daily challenges, extra levels, local history, streaks, puzzle creation, and shared puzzle links.

The app is a SwiftUI shell around a WebKit copy of the web game. It is not a native rewrite of the game engines.

## Current implementation state

Completed:

- Native daily-puzzle cache and WebKit bridge.
- Preparation for today plus the next 89 local calendar dates.
- Wi-Fi-first downloading.
- Cellular fallback only when fewer than 30 future dates are ready.
- Background URLSession and best-effort background refresh support.
- Local time-zone and midnight refresh behavior.
- Completed daily puzzles retained for today and the two previous local dates.
- Unfinished daily attempts retained.
- Idempotent daily completion and download installation.
- Shared immutable daily schedule published for 400 dates.
- `WordLinks/WordLinks.bundle/` is the canonical web-game source for both app and website.
- `tools/sync-wordlinks-bundle.mjs` regenerates the website bundle from that canonical source.
- The obsolete `/Users/cadensong/Documents/Beacon Wordroom Puzzle Room/` directory has been removed.

## Repositories and deployment

The repositories are separate:

- App repository: `Cadens0302/Word-Links`
- Website and daily schedule repository: `Cadens0302/Word-Links`

The app reads daily puzzles from:

`https://cadens0302.github.io/Word-Links/dist/daily/v1/<YYYY-MM-DD>.json`

The latest Word Links deployment commit is `61fd7aab58e61be70fa6b3603c30dc33d409c1cb`.

The published bundle contains the synchronized Word Links assets and 400 daily schedule files. The schedule currently covers `2026-11-02` through `2027-12-06`.

Verified public checks:

- [Word Links app](https://cadens0302.github.io/Word-Links/dist/index.html)
- [Today’s schedule file](https://cadens0302.github.io/Word-Links/dist/daily/v1/2026-11-04.json)

## Important files

- `WordLinks/DailyPuzzleDownloads.swift` — native cache, validation, retention, and background downloads.
- `WordLinks/ContentView.swift` — SwiftUI/WebKit shell and native bridge.
- `WordLinks/WordLinks.bundle/` — canonical bundled web game source.
- `publication/website/dist/` — deployment staging copy of the web bundle and schedules.
- `XCODE_APP_CONTEXT.md` — full product rules, source map, architecture, and troubleshooting.
- `OFFLINE_IMPLEMENTATION.md` — offline behavior, backup/import status, and known account-plan boundaries.
- `HANDOFF_STATUS.json` — machine-readable current state.
- `tools/sync-wordlinks-bundle.mjs` — copies canonical app bundle assets into website deployment staging.
- `Word Links.xcodeproj/` — Xcode project containing the app, unit tests, and UI tests.

## Recommended next task

1. Inspect `git status` and preserve unrelated user changes.
2. Read this file, `XCODE_APP_CONTEXT.md`, and `OFFLINE_IMPLEMENTATION.md`.
3. Open `Word Links.xcodeproj` and build the `Word Links` scheme with Xcode’s build action.
4. Run `node tools/sync-wordlinks-bundle.mjs` before website verification or publishing.
5. Test both games on a clean compact iPhone simulator.
6. Test daily loading, offline bundled levels, and a failed or missing daily schedule.
7. Test local midnight, time-zone changes, and app resume after suspension.
8. Verify completed daily puzzles remain available for today and the two previous dates.
9. If publishing is needed, verify the schedule and deploy only intended files to `Cadens0302/Word-Links`.

## Rules that must not be changed accidentally

- Daily identity uses the device’s local calendar date, not UTC.
- Published daily files are immutable.
- The daily cache target is 90 local dates, including today.
- Cellular downloads are allowed only below 30 ready future dates and only when the network is usable and not constrained.
- Completed daily puzzles are retained for today plus two previous local dates.
- Unfinished attempts are not deleted by daily cleanup.
- Built-in levels and bundled assets are never deleted by daily cleanup.
- Word Links scoring is the number of letters in submitted words; there is no base score.
- Do not add cloud sync, accounts, leaderboards, or guaranteed background execution without a separate product decision.
- Do not force-push the schedule repository or rewrite an already published daily puzzle.

## Troubleshooting order

If both games say that the daily puzzle is unavailable:

1. Check the exact local date and difficulty.
2. Open the public schedule URL for that date.
3. Inspect native cache status and validation errors.
4. Confirm the copied web bundle uses the expected `shared-daily.js` bridge.
5. Only then investigate the individual game engines.

If the app works after opening but not while closed, remember that iOS background execution is best effort. Improve scheduling and recovery, but do not promise guaranteed execution.

## Final handoff checklist

Before handing work to another AI:

- List changed files and why each changed.
- Report build and test results.
- State whether the public deployment was changed.
- Include any remaining limitation or unverified behavior.
- Preserve this guide and update `HANDOFF_STATUS.json` when implementation state changes.
