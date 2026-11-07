# Word Links — context for an iPhone app

> **Purpose:** Give an Xcode coding assistant a reliable, detailed description of the existing website and the intended iPhone app. Read this file **and the current `dist/` source** before changing game rules or building native screens. This file is a specification and source map; it is not an iOS project.

## 1. The product in one minute

**Word Links** is an independent word-game collection with two games:

1. **Word Links:** Connect two given words on a 15 × 15 letter board by placing valid crossing words. Minimize the total score; each letter in a submitted word costs one point.
2. **Mini Crossword:** Solve a connected 12 × 12 crossword with numbered Across and Down answers, clues, optional easier clues, and a once-per-puzzle word reveal.

The website has a welcome flow, a difficulty selector, daily challenges, sequential extra levels, separate game histories and streaks, and a puzzle creator with share links. The games use a newspaper-like cream, deep-green, and pale-lime design. The iPhone app should feel like the same product, with touch controls and a complete play view that does not require page scrolling.

**Name and tone:** Use “Word Links” for the collection, “Word Links” for game one, and “Mini Crossword” for game two. Keep copy friendly, concise, and thoughtful. The site intentionally avoids imitating Wordle.

**Current implementation:** The website remains static HTML, CSS, and vanilla JavaScript in `publication/website/dist/`; the root `index.html` redirects to `dist/`. `WordLinks/WordLinks.bundle/` is the canonical web-game source used by both products: Xcode packages it into the app, and `tools/sync-wordlinks-bundle.mjs` regenerates the website bundle from it. There is still no account system, server-side save database, or cloud progress sync.

## 0. Current native-app handoff (November 2026)

This repository now contains an Xcode iPhone app in addition to the website source. The native app is a SwiftUI shell around the bundled web game:

- Xcode project: `Word Links.xcodeproj`.
- App entry point: `WordLinks/Word_LinksApp.swift`.
- WebKit shell and JavaScript bridge: `WordLinks/ContentView.swift`.
- Native daily cache and background downloads: `WordLinks/DailyPuzzleDownloads.swift`.
- Canonical bundled game files: `WordLinks/WordLinks.bundle/`.
- Native storage location: Application Support/`SharedDailies/`; it is separate from the bundled read-only game assets.

The current working tree is intentionally dirty and contains user work. Preserve existing changes; do not reset, clean, or replace unrelated files. Use Xcode project tools for Xcode-organized files and build with Xcode’s `BuildProject` action. The app has already built successfully after the offline-cache changes.

The Xcode project is part of this same repository at `Word Links.xcodeproj`. If the online repository does not show it, the local project changes have not been pushed yet.

### Current deployment and takeover state

- A dedicated takeover guide is available in `START_HERE.md`; read it before this full context when joining the project.
- Machine-readable state is maintained in `HANDOFF_STATUS.json`.
- The Word Links web bundle is generated into `publication/website/dist/` from `WordLinks/WordLinks.bundle/`.
- The latest Word Links deployment commit is `61fd7aab58e61be70fa6b3603c30dc33d409c1cb`.
- The deployment contains the synchronized Word Links bundle and 400 daily schedule files covering `2026-11-02` through `2027-12-06`.
- The app, website, and daily schedule use the same repository: `Cadens0302/Word-Links`.
- Verified public paths are `https://cadens0302.github.io/Word-Links/dist/index.html` and `https://cadens0302.github.io/Word-Links/dist/daily/v1/2026-11-04.json`.

### Native daily puzzle contract

The authoritative daily schedule is published at:

`https://cadens0302.github.io/Word-Links/dist/daily/v1/<YYYY-MM-DD>.json`

The source repository is `Cadens0302/Word-Links`. The immutable schedule was published to its `main` branch in commit `1c5db366b8738c6aedf7efd109439866a54f11c3`, covering 400 dates beginning `2026-11-02`. The app’s `baseURL` must remain aligned with this Pages path unless the hosting location is deliberately changed in both the app and deployment configuration.

Each daily file is an envelope with `schema: 1`, a date, a SHA-256 checksum, and a JSON payload containing exactly eight records: `links` and `crossword` for `easy`, `medium`, `hard`, and `master`. Record IDs are `<date>:<difficulty>:<game>`. Native validation must reject wrong dates, duplicate IDs, malformed boards, invalid words/clues, altered checksums, and unsupported schema versions before replacing stored content.

### Download and retention rules

- Maintain the next **90 local calendar dates**, including today. The native date key uses the device’s current/autoupdating time zone, not UTC.
- Prefer Wi-Fi. Do not use cellular data while at least 30 future dates are ready.
- If fewer than 30 future dates are ready and Wi-Fi is unavailable, cellular may refill the cache to 90. Constrained networks remain disallowed.
- Use background `URLSession` downloads and `BGAppRefreshTask`. These are best-effort iOS facilities; the OS may delay or skip execution while the app is terminated. Recompute the current date whenever the app launches or returns to the foreground.
- Built-in levels and game assets in `WordLinks.bundle` are never removed by daily-cache cleanup.
- A completed daily puzzle remains stored for today and the two previous local dates. Cleanup may remove completed records older than that window. Unfinished attempts must be retained.
- Save completion results before cleanup. Completion and download installation must be idempotent so retries cannot lose progress.

### Native/WebKit boundary

`shared-daily.js` asks the native `dailyPuzzles` message handler for `today`, `begin`, and `complete`. Only the current date’s records and completion results cross the bridge. The web game remains responsible for rendering, local session state, histories, and difficulty selection; native storage is responsible for immutable daily records, durable completion records, and background acquisition.

When both games show “Today’s shared puzzle is not available yet,” inspect the native cache status and the schedule URL first. Both games intentionally share the same native daily cache, so the same message generally indicates a missing/404 schedule file or a failed native installation rather than two separate game bugs.

## 0.1 Latest maintenance log — November 5, 2026

**Completed in the latest command:**

- Confirmed there are no Beacon-named files remaining in the active Word Links workspace.
- Established `WordLinks/WordLinks.bundle/` as the canonical web-game source for both the app and website.
- Added `tools/sync-wordlinks-bundle.mjs` so website assets are regenerated from the app source.
- Fixed the synchronization and verification tools to use the repository’s root `dist/` when running in the GitHub Pages checkout, while retaining `publication/website/dist/` for the local staging workspace.
- Updated the website validation workflow to synchronize before verifying.
- Preserved legacy offline database names, backup format identifiers, JavaScript bridge names, and published daily URLs so existing progress and cached data remain compatible.
- Removed the obsolete attached `/Users/cadensong/Documents/Beacon Wordroom Puzzle Room/` directory.

**Next recommended work:**

- Add a local development command that runs synchronization and serves `publication/website/dist/`.
- Keep future web-game edits in `WordLinks/WordLinks.bundle/`, then run synchronization and verification before publishing.
- Push the current Xcode project, shared bundle, README, and updated context files to `Cadens0302/Word-Links` so the online repository matches this workspace.

**Completed in the following maintenance command:**

- Confirmed the local `Word Links.xcodeproj` contains the `Word Links`, `Word LinksTests`, and `Word LinksUITests` targets.
- Added a repository README describing the Xcode project, canonical bundle, website staging, and verification commands.
- Updated `START_HERE.md`, `HANDOFF_STATUS.json`, and this context to state that the app and website share the `Cadens0302/Word-Links` repository.
- Recorded that the online repository must be updated by pushing these local changes; this workspace has no Git remote configured.
- Prepared remote-ready commit `f3ce7e9` containing the Xcode project, shared bundle, website output, and corrected root-`dist` tools. The push was attempted but blocked because this environment has no GitHub credentials configured; push that commit to `main` from an authenticated Git client.

## 0.2 Offline and daily-publisher ownership — November 5, 2026

- The app does **not** generate or publish daily puzzles. `DailyPuzzleDownloads.swift` downloads already-published JSON envelopes, validates their date, IDs, board data, and checksum, then stores up to 90 local dates in Application Support.
- The website does **not** generate or publish daily puzzles at runtime. It fetches the same date-keyed JSON files from the GitHub Pages URL and caches them with the service worker and browser storage when available.
- `tools/generate-daily-schedule.mjs` now deterministically adds missing future dates from the validated schedule catalog without rewriting existing dates.
- `.github/workflows/generate-daily-schedule.yml` is the intended GitHub Actions publisher. It runs daily, maintains 400 dates, validates the result, commits only new schedule files, and lets GitHub Pages deploy the commit.
- The generator supports easy, medium, hard, and master records for both games. It uses existing validated records as deterministic templates until a full content-authoring generator is introduced.
- The local schedule now validates 404 files through `2027-12-10`; the prepared remote commits are `f3ce7e9`, `c39a765`, and `9b38299`. They still require an authenticated push.
- Offline play still works for bundled levels, dictionaries, and saved progress. A daily puzzle works offline only after its validated JSON has been downloaded and cached; a missing future daily file cannot be invented by the app.

## 2. How to use this document

- Treat the `dist/` JavaScript as the **current behavior reference** when this document and code disagree. Inspect code before porting an edge case.
- Preserve the game rules, content, progress separation, and branding. A native layout may change how those are presented.
- Do not silently replace the one-point scoring rule with the older “10 points plus letters” idea, use a 20 × 20 crossword, add diagonal words, or bring back age groups. Those were older ideas; the current product uses the rules below.
- Distinguish a **daily puzzle** from **local player progress**. Same date and difficulty produce a stable puzzle; solved history is currently stored only on that device.
- Do not invent cloud sync, public leaderboards, login, notifications, or payments. Those need separate product decisions and infrastructure.

## 3. Source map

| File | What it controls |
| --- | --- |
| `dist/index.html` | Page structure, all major dialog containers, board labels, action buttons, script order. |
| `dist/game.js` | Word Links board, placement validation, scoring, clue candidates, game state, creator entry point. |
| `dist/daily.js` | Word Links daily generation, levels, history, best scores, streaks, completion. |
| `dist/levels.js` | 50 Word Links level definitions, names, labels, target scores, starter pairs. |
| `dist/crossword.js` | Crossword word/clue pools, generation, 35 levels, entry, hints, reveal, history, completion. |
| `dist/age-settings.js` | The **current difficulty selector** (the old age-related variable names remain for compatibility), confirmation dialogs. |
| `dist/daily-clock.js` | Local date keys and local-midnight rollover event. |
| `dist/clues.js` | Authored word descriptions for clues. |
| `dist/dictionary.js`, `dictionary-extra.js`, `dictionary-expanded.js` | Additional accepted words. `game.js` also contains a base list and extra words. |
| `dist/custom-puzzles.js` | Puzzle builder, validation, share-link encoding, shared-puzzle mode, completion redirect. |
| `dist/game-directions.js` | Quick-start directions for each game, merged with a streak message on regular games. |
| `dist/styles.css`, `action-buttons.css`, `custom-puzzles.css`, `age-slider.css`, `game-directions.css`, `motion.css`, `mobile-play.css`, `mobile-polish.css`, `presentation.css` | Visual design, app-wide spacing, responsive layouts, interactions, and animation. |
| `dist/mobile-play.js` | Phone-specific compact controls, two-direction crossword tabs with one visible clue and previous/next navigation, puzzle options, and vector icons. |
| `dist/mobile-keyboard.js` | Touch keyboard for Word Links and Crossword; overlays the viewport and disables the operating-system keyboard while mobile play is active. |
| `dist/mobile-polish.css` | Mobile spacing, readable type, touch keyboard sizing, and small-screen layout refinements. |

The website displays the accepted-word count by calculating the deduplicated `WORDS` set at runtime. At the time this context was written, the chooser displayed **203,752 words**. Recalculate from the source in the app; do not hardcode a number that will become stale.

## 4. Main user journeys

### First open or reload

1. Show the collection welcome message.
2. Let the player choose **Easy, Medium, Hard, or Masters**. The current website asks once per page load; changing games during the same visit does not force another selection. Default is Medium until changed.
3. Show two game cards with brief descriptions and the dictionary count.
4. Opening a game presents a quick-start directions popup. On the regular game, this popup also shows that game’s daily streak and has “Let’s play” and “Choose a level.” On a shared player-made puzzle, show directions without the regular-game streak.
5. The three-line **☰** button in the top-right corner opens the game chooser again. It is a game switcher, not an unrelated settings menu.

The player can change difficulty from either game. This changes the relevant daily puzzle and the suitable vocabulary. In a native app, keep the same conceptual flow, but use native navigation, sheets, and touch-friendly focus.

### During a game

- Main actions are **Daily challenge**, **Extra puzzles**, **Puzzle history**, **Restart puzzle**, and a prominent **Create a puzzle** action.
- Daily challenges have a visible title containing game, difficulty, and local date. They switch at **12:00 AM device-local time**. Rechecking on foreground/resume is necessary because the app may have been suspended at midnight.
- Extra levels unlock one at a time after the previous level is solved. Completed levels stay marked complete. “Move on to next puzzle” appears only for level play; before completion it looks unavailable and tapping it says, “Finish this level to continue to the next level.”
- Restart is destructive to the current unfinished entries and uses an in-product “Are you sure?” confirmation, not an operating-system alert with unrelated styling. It should not erase earned history or previous bests.
- Closing and reopening a normal daily or level puzzle resumes its entered letters/words and selected state.
- Each game’s history popup has **All**, **Daily challenges**, and **Levels** sections, stays a stable size, and scrolls its *list* rather than the whole background.

## 5. Difficulty rules

These are global mode choices, not ages. The source still uses names such as `WORD_AGE_GROUP`; their values are currently difficulty IDs.

| Mode | Word Links starting words | Word Links gap between starting words | Crossword answer length filter | Intended feel |
| --- | --- | --- | --- | --- |
| Easy | 6–8 letters | 2–4 cells | 3–6 letters | Familiar words, easier crossing options. |
| Medium | 5–6 letters | 5–6 cells | 4–7 letters | More planning, still approachable. |
| Hard | 4–5 letters | 7–9 cells | 5–8 letters | Fewer starter letters and harder vocabulary. |
| Masters | 3–4 letters | 10–12 cells | 6–9 letters | Widest gap, shortest starters, toughest crossword vocabulary. |

The crossword generator also biases Hard and Masters toward an authored pool of more academic or less familiar answers. Level definitions have their own progression; the global difficulty shifts the selected vocabulary inside that progression. If the app ports generation, keep that distinction.

The older on-page quick guide still says “age setting” in one sentence. That is stale wording; the product should say **difficulty** in the app.

## 6. Word Links: exact play rules

### Board and input

- The board is **15 columns A–O by 15 rows 1–15**. A coordinate like `F4` means column F, row 4. Internally the website uses zero-based row and column indices.
- Two different starting words are already shown in muted green. Their placement is seeded and may be horizontal, straight down, or mixed. Starting words do not overlap or touch.
- Tap a square to choose an anchor. Enter a word in the word field and choose **Up, Down, Left, or Right**. The chosen direction is visible and accessible by name.
- The player’s placed words appear in pale lime. Current selection and preview are distinct; a clue’s suggested start and end squares have two different highlight colors.
- New words must be **2–15 ASCII letters**, appear in the accepted dictionary, and not duplicate an existing board word. The creator’s two starting words have a tighter **3–15 letter** requirement.
- A word that crosses an existing word may share only the *same letter*, and the old word must run perpendicular to the new word. The new word must add at least one previously empty square.
- A word cannot extend outside the board. Changing direction with a typed word that would cross the edge must show a clear error; do not silently bounce, wrap, or shift it.
- Keep a blank square before and after the main word. Unrelated words cannot overlap in the same direction.

### Connection validation: important edge cases

The website’s `validate()` in `dist/game.js` is more nuanced than “cross exactly one word”:

1. A regular new word must connect to **one** existing word. A legal side-by-side contact can count as a connection **only if** all new perpendicular letter runs it creates are real dictionary words.
2. A side contact must form a **complete word of at least three letters**; a stray one- or two-letter attachment is not enough. The current validator also accepts the reverse spelling of the perpendicular run.
3. The winning bridge is special: it may connect **exactly two existing words**, one from each previously disconnected group containing the two starters. This is how the board is completed.
4. Merely touching the other group visually is not victory. The full newly formed word or words must be valid. This specifically matters for earlier reported situations such as connecting `BIRD` to `TREE` with `SET`, or placing `POP` near `CUP` and `PEN`.
5. After submission, update connected components of the placed-word graph. The goal is to connect the two starting groups. Show a useful error when the move violates a rule.

The validator can align the selected square to a matching letter later in the typed word when that yields a legal placement. A native version should keep this convenience or explicitly present the intended anchor before submission.

### Score, win, levels

- **Score = sum of every submitted word’s letter count.** There is **no base 10-point charge**. Starting words cost zero. A five-letter placed word adds five points.
- Lower score is better. Show current total and links placed. Each Word Links level has a recommended target score, and solved levels retain a personal best.
- On a winning submission, lock further word entry, congratulate the player, show the score, update the correct history, and update daily streak only for a daily puzzle. The level’s next button becomes available after completion.
- There are **50 sequential Word Links levels** in `dist/levels.js`. The display progression is 1–10 Easy, 11–20 Medium, 21–30 Hard, 31–40 Expert, 41–50 Master. A player may replay completed levels.

### Word Links clue controls

- “Get a clue” is free and should **not itself consume a reroll**. A clue describes a legal next word without saying it, gives the **start and end coordinates**, orientation, letter count, and strategic next-step advice. Highlight the start and end squares.
- The next clue should be based on the actual current board, favor a move toward the other starter, and be a legal placement. Avoid repeating a prior clue when a different useful move exists.
- Regular puzzles have **three rerolls** and **one easier clue**. Reroll must choose a different word **and** a different starting square when possible; never cycle the same few hints. If none is available, explain that placing another word may create more choices.
- Reroll and easier-clue buttons look disabled until a clue is open. They show remaining uses. An easier clue expands the current clue with more direct information, including the word’s first letter, crossing, and ending coordinate; once used, its content stays visible while that clue is shown.
- On mobile, opening a clue shows a bottom sheet over the board; the board and word-entry controls still fit on one screen when the sheet is closed.

## 7.  Mini Crossword: exact play rules

### Board and puzzle construction

- The board is **12 × 12** with rounded outer corners. Unused cells are **black**, but still visibly separated by fine grid lines. Active cells are light with dark letters. Highlight the selected answer in pale green.
- Answers are **Across or Down only**. There are **no diagonal crossword words**. The generated grid forms one connected group; each added entry crosses the existing network at a matching letter, with spacing that avoids an overly dense block.
- Answers vary in length. Current daily puzzles generate **8 connected entries**, and normal levels generate **9**. The creator accepts **8–24** word/clue input lines but the current generated player puzzle places **8** answers; exact-square creator mode requires 8 placed entries.
- The daily generator uses a curated pool assembled from the accepted dictionary and authored clue bank. It is date- and difficulty-seeded and selects a different set on adjacent dates where possible. Do not pick arbitrary words from the giant dictionary without usable clues.
- There are **35 sequential crossword levels**, separate from Word Links levels. Levels progress from shorter/familiar answers to longer/harder answers. Completion unlocks the next one.

### Clues and typing

- Every answer has its own number and an arrow. If an Across and a Down answer start in the same square, show **two separate numbers/arrows** without covering the letter. Right arrows sit below their number; left arrows above it. Numbers and arrows must remain visible on hover, focus, and active states.
- Across and Down clue lists are separate. Tapping a clue selects and highlights its answer, focuses its first cell, and jumps the player to the right word. Tapping a square selects an answer using that cell; tapping the same crossing square again can switch to the other answer.
- Enter **one letter per open square** and advance through the selected answer. Backspace clears or moves backward. Arrow keys move between cells where a hardware keyboard is available. Shared crossing cells update both words.
- Each completed answer gets a checkmark beside its clue. Pressing **Check puzzle** marks wrong squares in a clear error color and shows feedback; solving all answers congratulates the player.
- Each clue has a triangle expander. Only one expanded clue should be open at a time. The expanded hint should be genuinely more helpful than the first clue, ideally an everyday description and the answer’s first and last letters, without directly naming the answer.
- The **Reveal this word** control appears only under the currently expanded clue. Regular crossword puzzles allow **one word reveal per puzzle**. Show the remaining use in the button text. A revealed answer fills its cells and consumes the use.
- On a phone, keep the full board, visible **Across** and **Down** section buttons, the selected clue and its triangle, a visible read-only answer field, **Previous** and **Next** clue controls, feedback, progress, and **Check puzzle** visible without page scrolling. The answer field mirrors letters already entered for the selected clue; tapping it focuses the next empty square and opens the custom keyboard. The clue selector shows exactly one clue at a time; previous/next changes that clue within its active direction. The triangle stays beside the visible clue and expands its easier clue. Across/Down switch between horizontal and vertical answers; there are no diagonal answers and no scrolling clue list or all-clues popup on phone.

### Crossword completion and history

- Daily crossword success records the local date and difficulty, then updates the **crossword’s own streak** and history. Level success marks that crossword level complete, unlocks the next, and records level history. Player-made puzzle success has its own completion message and a button back to the real game.
- Crossword currently tracks a filled-letter progress bar/count and solved history. It does **not** use the Word Links points model; do not fabricate a crossword point score in a port.
- Daily and level puzzle input is saved and resumes after the page/tab closes. Custom-puzzle progress is intentionally not added to normal history.

## 8. Daily identity, midnight, and persistence

### Daily puzzle identity

- Daily keys use the **device’s local calendar date** (`YYYY-MM-DD`) rather than UTC. `dist/daily-clock.js` schedules the next local midnight with calendar arithmetic and checks again on focus, page show, and visibility return. In iOS, recalculate on app foreground and after device time/time-zone changes.
- Within the same date and difficulty, the published schedule file is the authority, so a daily puzzle must stay the **same across users, devices, website sessions, and app launches**. Different difficulties get distinct daily puzzles. Its title includes the date and difficulty.
- The crossword generator has an explicit version constant (`MINI_DAILY_GENERATOR_VERSION = 8` when this file was written). Word Links seeds and level session keys also contain version tags. Preserve/version a deterministic generator when changing it so old saved progress cannot silently attach to a different board.
- Word Links daily starters deliberately avoid both of the previous day’s starters where the pool allows. Crossword daily selection partitions its curated pool by day parity to reduce adjacent-day repeats.

### What is currently saved

The website uses browser `localStorage`; there is no account or cloud sync. These are useful migration references, not mandatory Swift model names:

| Data | Current keys / shape | Meaning |
| --- | --- | --- |
| Word Links daily completions | `wordLinksDailyHistoryV1` | Date, difficulty (legacy field `ageGroup`), title, score, words. |
| Word Links level bests/completed/history | `wordLinksExtraBestV2`, `wordLinksExtraCompletedV1`, `wordLinksExtraHistoryV1` | Personal best by level, unlock state, dated solves. |
| Word Links in-progress board | `dailyChallenge:Word Links:…` or `wordLinksSession:level:v4:…` | Placed words, score, selected square, direction, draft, clue state, feedback. |
| Stable daily Word Links layout | `wordLinksDailyLayoutsV6` | Starting-word positions for a date and difficulty. |
| Crossword daily history | `wordLinksMiniHistory` | Completed dates, difficulty, title. |
| Crossword level progress | `wordLinksMiniLevelProgress` | Completed/best/history for crossword levels. |
| Crossword in-progress board | `dailyChallenge:Mini Crossword:v8:…` or `wordLinksMiniSession:level:v2:…` | Entries, typed cells, selected clue, reveal/hint state, feedback. |

Streaks are **calculated from solved daily dates**, separately for each game and difficulty; they are not just a stored counter. Solving yesterday still keeps a streak alive until today is solved. In a native app, save state after every meaningful action and restore it on launch. Keep game types and difficulties separated to avoid mixing boards or history.

Local progress **does not automatically appear on another phone**. Identical daily puzzles across devices are a generation property, not progress synchronization. Cloud sync would be a new feature.

## 9. Create and share a puzzle

The same prominent **Create a puzzle** button appears in both games. The builder is a styled in-product popup.

### Word Links builder

- Enter two distinct dictionary starting words (3–15 letters), optional title (maximum 40 characters), exact starting squares, and direction for each. A 15 × 15 preview shows letters as the creator selects locations by tapping the grid.
- Starting words must fit, not overlap, and not touch. Default clue settings are **unlimited normal clues, 3 rerolls, 1 easier clue**; the creator may change rerolls and easier-clue counts to 0–20 or unlimited.
- The creator can play or copy a share link. Playing a self-made puzzle does not count toward normal daily or level history.

### Crossword builder

- Enter lines like `GARDEN | A place where flowers grow`. Answer words must be distinct, dictionary-valid, 3–9 letters, and each has a written clue. An optional exact-placement form adds coordinate and orientation, for example `GARDEN | A place where flowers grow | B4 | across`.
- The generated creator crossword arranges eight connected entries from the supplied pool. Exact placement needs exactly eight; every later word crosses the existing network appropriately. Show an understandable error when eight connected answers cannot be built.
- The creator can set **layout rerolls** and easier-clue counts; normal clues remain freely viewable. The current code allows **one word reveal** in both regular and player-made crosswords. The builder does not expose a separate reveal-count setting.

### Shared-link experience

- Current share URLs store a versioned, URL-safe Base64 JSON payload in the fragment: `#puzzle=…`, with game type (`links` or `crossword`), title, words/entries, placements, and limits. The recipient opens a focused puzzle-only view.
- A shared-puzzle view **must not expose** switch-game, daily, levels, normal history, or create-puzzle controls. It must have an obvious **Open real game** button at any time, not just after solving; that button must not cover other controls.
- Show directions for the shared game, then the puzzle. On completion, show a congratulations popup with a way to open the main game. Shared/custom puzzles are not counted in daily streaks or normal histories.
- The iPhone app should be able to open a valid shared puzzle link into the correct game. Decide the native deep-link/universal-link implementation when building the Xcode project; keep the payload format versioned if interoperability with website links is required.

## 10. iPhone layout and interaction details

The recent website mobile work provides a concrete reference in `dist/mobile-play.css` and `dist/mobile-play.js`. Preserve the *behavioral goal* in a native app:

- At compact portrait widths (including **320 × 568**), **the active board and turn controls fit in one screen**. Do not make the player scroll the main page just to place a word or check a crossword.
- Word Links shows compact masthead, short title, board, score, word field, submit button, four directions, feedback, and Get a clue. Secondary actions open **Puzzles & options**. The clue appears in a bottom sheet.
- Crossword shows compact masthead/title, full 12 × 12 board, one selected Across or Down clue, its easier-clue dropdown, previous/next, feedback, progress, and Check puzzle. The clue selector does not scroll or open a clue-list sheet. Puzzle options similarly open over the game.
- The first-run difficulty chooser and directions popup must also keep their **Continue / Let’s play** buttons visible on a small phone. The player should not need to hunt for a start button below the viewport.
- Keep the grid square: every row and column has equal-size cells and aligned labels. Avoid oversized letters or number/arrow badges covering crossword answers. Respect safe areas and the software keyboard.
- Touch targets need enough space and clear selection states. Do not rely on hover for essential controls; hover color is a desktop enhancement.
- Provide an in-app QWERTY keyboard for Word Links and crossword entry on phone. Tapping a text field or crossword cell must not open the device keyboard. Include letter keys, delete, and a dismiss/done control. Word Links keys edit the current word field; crossword keys fill the selected square and advance through the active answer. Keep hardware-keyboard support on desktop/tablet where available.
- Show errors next to the action in plain language, use visible disabled states, and keep controls stable instead of jumping on each tap.

## 11. Visual style and motion

- Palette from `dist/styles.css`: paper `#f7f6f0`, deep ink `#243930`, muted gray-green `#70786f`, fine border `#d7dbd1`, lime action color `#e1eea5`, starting-word green `#d6e4d5`.
- Large editorial headings and game title use a serif style resembling Georgia; controls and body text use a clean sans-serif. Thin rules, quiet uppercase eyebrow labels, rounded cards and grid corners, and a dark-green score card create the newspaper-room feel.
- Make important actions stand out, especially **Create a puzzle**, **Submit word**, and **Check puzzle**. Keep secondary actions orderly. Highlight active selections and crossword checks without losing the small clue numbers/arrows.
- Buttons subtly change color on hover/press and give a small satisfying press response. Panels/sheets rise or fade in smoothly; clue and checkmark reveals have short animations. Avoid a flash of a different screen during navigation or replaying the entire game-entrance animation when simply closing a popup.
- Honor **Reduce Motion**. The web implementation disables animation under `prefers-reduced-motion: reduce`; map that to iOS accessibility settings.

### Interaction polish handoff (November 2026)

- Use short, restrained motion that supports the action: buttons get a quick press response, successful cells fill with a subtle pop, status changes settle smoothly, and dialogs enter without flashing an unrelated screen.
- Never leave a tap looking selected after the action. Touch browsers can latch `:hover` and pointer focus; clear pointer focus after activation while retaining visible focus for keyboard navigation. Keep persistent selected states only for controls with an actual selected value, such as the direction selector or active crossword clue.
- Use a consistent 160–220 ms easing curve for hover and press transitions, and keep entrance/reveal motion around 200–380 ms. Avoid repeated bouncing, large translations, or animation that shifts the board and controls.
- Respect Reduce Motion by removing transitions and animations, while keeping state changes clear through color, borders, and text.

## 12. Current app structure and continuation rules

The current iPhone implementation bundles the existing web experience in a SwiftUI/WebKit shell and adds native handling for durable daily records, background downloads, local-time date selection, and the iOS share sheet. Continue with this architecture unless a deliberate native rewrite is requested.

- Keep **Word Links** and **Crossword** game logic independent. Shared infrastructure should cover only difficulty, local date, navigation, persistence, and daily-cache access.
- Treat the published daily JSON files as immutable content. Do not silently regenerate a missing published date in the app; fix the publisher or hosting path instead.
- Keep bundled levels and dictionaries read-only. Do not put daily-cache cleanup logic against `WordLinks.bundle`.
- Preserve the native/WebKit bridge contract (`today`, `begin`, `complete`) unless all corresponding JavaScript callers and tests are updated together.
- Use stable IDs containing date, difficulty, and game. Never use array position or a transient download task ID as puzzle identity.
- Do not promise cross-device progress. Daily puzzle equality is provided by the published schedule; progress remains device-local until a real account/sync design exists.
- If the daily schema, board generator, or content rules change, publish a new schema/version and retain old schedule files needed by installed app versions.
- For background work, use `BGAppRefreshTask` and background `URLSession`; never describe iOS background execution as guaranteed. Test both foreground recovery and delayed background delivery.

### Release preparation still to decide

The Xcode project and app shell now exist, but bundle signing, App Store listing assets, production entitlements, and final device validation remain release tasks. Keep signing credentials out of source control. Before submission, verify current Apple review and privacy requirements for the chosen app architecture, and test installation, app suspension/resume, offline launch, schedule downloads, sharing/deep links, and saved progress on real devices. A successful simulator build is not proof of App Store acceptance.

## 13. Acceptance checklist for the Xcode app

### Core rules

- [ ] Word Links 15 × 15, two starters, four directions, dictionary validation, side-word validation, legal final bridge, one point per submitted letter, lower score wins.
- [ ] Crossword 12 × 12, black unused cells with visible grid, connected Across/Down answers, separate numbers and arrows, correct one-letter typing, crossing switch, clue completion checks.
- [ ] Easy/Medium/Hard/Masters meaningfully differ without changing the basic rules.

### Navigation and content

- [ ] Welcome → difficulty → game chooser → game directions works on first launch; changing games in the same visit retains difficulty.
- [ ] Both games expose daily, levels, history, restart, and prominent create controls; a shared puzzle exposes only puzzle-relevant controls and Open real game.
- [ ] 50 Word Links levels and 35 crossword levels unlock sequentially and retain completion.
- [ ] Daily titles include local date and difficulty; both games refresh on local midnight or resume.

### Help and progress

- [ ] Word Links normal clue gives a real legal route and highlights start/end; reroll and easier counts are correct and do not auto-reroll.
- [ ] Crossword triangle expands one clue at a time; reveal appears only there and is once per regular puzzle.
- [ ] Daily streaks, history, level progress, and in-progress state remain separate between games and modes and survive app termination.
- [ ] Restart asks for confirmation and clears the current board without erasing earned history.

### iPhone polish

- [ ] Main play view needs no page scroll at small phone sizes; start/continue controls remain visible in onboarding.
- [ ] Grid squares, letters, labels, clue numbers, and arrows remain readable at compact sizes; safe areas and keyboard do not cover the active control.
- [ ] Popups, sheets, buttons, and game changes animate without flashing another screen; Reduce Motion is respected.
- [ ] Shared web puzzle links either open the matching native puzzle or clearly open the compatible website.

## 14. Known boundaries to surface, not silently change

- There is no account, remote save, public score database, or friends leaderboard. Word Links “best” is a local personal best.
- Crossword does not currently award a numeric score like Word Links.
- Published daily puzzles are immutable date-keyed records. People in different time zones change which date is “today” at their own local midnight, but everyone receives the same record for a given date and difficulty.
- The site’s very large Word Links dictionary includes obscure entries, while clue-backed crossword generation uses a much smaller authored pool. The iPhone app should keep those purposes distinct.
- Product wording in a few legacy source names and descriptions still says “age” even though the current UI uses **difficulty**. Use the current player-facing terminology.

## 15. Detailed transfer and maintenance instructions

This section is intentionally operational. A future coding assistant should read it before making changes to offline daily puzzles, the WebKit bridge, background execution, or the publication repository.

### 15.1 Start-of-task checklist

1. Read this file completely.
2. Inspect the current Xcode project tree and read the relevant source instead of assuming the context is newer than the code.
3. Check `git status --short`. The repository may contain unfinished user work and generated publication files. Preserve it.
4. Determine whether the request concerns the native shell, the bundled web game, the daily schedule publisher, or more than one of those systems.
5. For Apple framework work, consult current Apple documentation through Xcode documentation search. SwiftUI, BackgroundTasks, WebKit, and URLSession behavior can change between SDKs.
6. Use Xcode’s project-aware read/write tools for files in the Xcode project. Build with `BuildProject`; do not treat a successful JavaScript check as proof that Swift compiles.
7. After a code change, run a build. For UI or lifecycle changes, install and run on a simulator or device and verify the actual state, not only the compiler result.

### 15.2 Native file responsibilities

`Word_LinksApp.swift` is the SwiftUI application entry point. It uses `UIApplicationDelegateAdaptor` to attach `WordroomAppDelegate`.

`ContentView.swift` owns the `WKWebView` wrapper. It:

- Loads `WordLinks.bundle/index.html` with `loadFileURL(_:allowingReadAccessTo:)`.
- Uses `WKWebsiteDataStore.default()` so WebKit localStorage/IndexedDB survive app suspension and relaunch.
- Registers the page-world `dailyPuzzles` reply handler.
- Registers native handlers for copying validated website share links and exporting the web backup JSON through the iOS share sheet.
- Refreshes the web daily state on app activation, significant time changes, and native download-change notifications.
- Must not expose arbitrary native file access or accept unvalidated URLs from JavaScript.

`DailyPuzzleDownloads.swift` is the source of truth for native daily files. It is `@MainActor`, owns the Application Support cache, validates and installs downloaded envelopes, stores completion results, tracks started records, schedules background work, and implements `URLSessionDownloadDelegate`.

`Word_Links.entitlements` and `Info.plist` contain app configuration. The current plist declares `fetch` and `remote-notification` background modes and permits `com.beaconwordroom.daily-refresh`. Do not add capabilities merely because they sound useful; confirm that an Apple API requires them.

`WordLinks.bundle` is the shipped web product. It includes the games, dictionaries, levels, styles, service-worker/offline support, and the JavaScript daily bridge. It is not the native daily-file cache and must remain available even when every network request fails.

### 15.3 Native daily-cache state machine

The daily cache is date-keyed. A date file contains records for that date; `results.json` contains durable completion results; `started.json` marks records that have been opened so unfinished attempts are not treated as disposable.

#### Installation

1. A background or foreground URLSession task downloads `<date>.json`.
2. The delegate checks for HTTP 200 and reads the temporary download file before returning from the delegate callback.
3. `DailyPuzzleDownloads.validate(_:expectedDate:)` validates size, schema, date, checksum, record count, IDs, difficulty, game, words, clues, directions, and board bounds.
4. `install(_:date:)` merges only valid immutable records. Existing valid records are not replaced casually.
5. A completed record is not discarded on reinstall while it is inside the two-previous-day retention window.
6. A change notification causes the WebKit page to call `window.WordroomDaily?.refresh()`.

#### Begin

When the web game starts today’s daily puzzle, it sends `{ operation: "begin", id: "<date>:<difficulty>:<game>" }`. Native marks that ID in `started.json`. This is a recovery marker, not a completion marker. Never delete an unfinished attempt merely because it is marked started.

#### Complete

The web game first saves its normal history entry in localStorage, then sends `{ operation: "complete", id, result }`. Native verifies that the ID is for the current local date, a supported difficulty/game, and a matching result date/difficulty. Native writes the result before any cleanup. Completion is idempotent: retrying the same completion must not duplicate or corrupt history.

Completed daily records stay available for today and the two previous local calendar dates. On a later refresh, native removes completed records older than that window. This delayed deletion is intentional so users can retain recent daily puzzles. Unfinished records are retained for recovery.

#### Today request

The web game sends `{ operation: "today" }`. Native returns a dictionary shaped like:

```text
{
  date: "YYYY-MM-DD",
  records: [daily record objects for today that are not completed],
  completed: { "<date>:<difficulty>:<game>": result object },
  status: "user-readable preparation status"
}
```

The native response must remain property-list/JavaScript bridge compatible: strings, arrays, dictionaries, numbers, booleans, and null-compatible values only. Do not return Swift types or URL objects through the bridge.

### 15.4 Download policy in exact terms

The cache window is 90 local dates: today plus the following 89 dates. “Ready” means that every supported combination—four difficulties × two games—has either an installed record or a durable completion result for that date.

- Wi-Fi available: use the Wi-Fi background session and request missing dates until the 90-date window is complete.
- Wi-Fi unavailable, fewer than 30 ready future dates, and usable cellular available: use the cellular-capable background session and request missing dates until 90 are ready.
- Wi-Fi unavailable and at least 30 ready future dates: do not start cellular downloads.
- Constrained networks are not accepted.
- Cellular is a fallback, not the normal path. Do not change the threshold or target without updating user-facing copy and tests.
- Duplicate date requests must be suppressed across both background sessions by examining all active task descriptions.
- Today should receive high priority; later dates may be low priority.
- The app may be suspended or terminated between scheduling and completion. The code must be safe when the OS relaunches it for background URLSession events.

The system is not a guaranteed scheduler. `BGAppRefreshTask` gives the app a short, system-selected opportunity; background URLSession transfers can continue while suspended, but the system controls timing and may delay work. Never promise users that all 90 files will be present immediately after installation. The first foreground launch is the reliable trigger; later background refreshes are best effort.

### 15.5 Time-zone and date rules

The native date key and JavaScript `puzzleDateKey()` must agree on local calendar date. Do not use UTC date strings for the player-facing daily identity. The native formatter uses an autoupdating current time zone; JavaScript uses local `Date` getters.

When the app returns to the foreground, refresh native storage and ask the web page to re-check local midnight. A device traveling across time zones may select a different date without changing the content associated with any already-published date. Do not rewrite a puzzle’s ID when the time zone changes.

When testing date behavior, cover:

- Just before and just after local midnight.
- A daylight-saving transition.
- Moving the simulator across time zones.
- App suspension across midnight.
- A device clock that is temporarily incorrect.
- A future date that has a published file versus a missing date.

### 15.6 Web/native bridge rules

`shared-daily.js` is loaded by both games. It is the common gatekeeper, so a native daily-cache failure can block Word Links and Crossword at the same time. This is expected architecture, not evidence that both game engines failed independently.

The bridge must preserve these operation names and meanings:

| Operation | JavaScript sends | Native action | JavaScript expects |
|---|---|---|---|
| `today` | `{ operation: "today" }` | Read current date, records, completions, status | State dictionary described above. |
| `begin` | `{ operation: "begin", id }` | Mark an unfinished daily attempt as started | Updated state dictionary. |
| `complete` | `{ operation: "complete", id, result }` | Validate and durably save the result | Updated state dictionary. |

If a bridge call fails, the page should show a truthful recovery message and keep local game progress. Do not claim that a puzzle was saved when native storage rejected it. If the native cache is unavailable, the user can still play bundled levels.

### 15.7 Schedule publishing procedure

The app repository is `Cadens0302/Word-Links`. The schedule repository is separate: `Cadens0302/Word-Links`. Do not publish daily JSON files to the app repository and assume the app’s URL will see them.

The expected public path is:

`https://cadens0302.github.io/Word-Links/dist/daily/v1/`

The local staging directory is `publication/daily/v1/`. These files may be untracked in the app workspace because they are publication artifacts, not Xcode bundle resources. The authoritative remote files belong under `dist/daily/v1/` in `Word-Links`.

Before publishing:

1. Confirm every file name is exactly `YYYY-MM-DD.json`.
2. Confirm each envelope date matches its file name.
3. Confirm each file has eight unique IDs and all eight supported combinations.
4. Confirm the checksum validates the exact UTF-8 payload.
5. Confirm no existing immutable date is being rewritten. If content rules change, use a new schedule/schema version rather than silently replacing a published date.
6. Confirm the current app `baseURL` and website relative URL point to the same schedule host/path.
7. Publish only the schedule files or the intended publisher workflow; do not include unrelated app worktree changes.
8. Verify both the raw GitHub URL and the GitHub Pages URL. Raw GitHub can become available before Pages propagation completes.

The publication workflow, when present in the schedule repository, may generate future dates and deploy Pages. A Pages 404 after a successful commit can be propagation or a Pages-source configuration problem; it is not fixed by changing puzzle validation. Check the deployed path before changing app code.

### 15.8 Troubleshooting matrix

| Symptom | First checks | Likely cause | Correct response |
|---|---|---|---|
| Both games say the daily puzzle is unavailable | Check the schedule URL for today’s exact local date; inspect native status | Missing/404 schedule file or failed native install | Fix publication/hosting or validation input. Do not patch two game engines separately. |
| Status says waiting for Wi-Fi | Check NWPathMonitor state and cache count | No Wi-Fi and cache is at/above the cellular threshold | Expected policy behavior. Connect Wi-Fi or wait for a permitted refresh. |
| Cellular never starts below 30 | Check path is satisfied, not constrained, and uses cellular; check cellular session identifier | Simulator/network path does not report usable cellular, or background session policy blocks it | Test on a real cellular device; do not infer cellular behavior from a Wi-Fi simulator. |
| Today file exists remotely but is not installed | Validate HTTP status, envelope checksum, eight records, ID/date, board bounds | File shape/version mismatch or stale endpoint | Fix the publisher/schema, then retry. Keep existing valid cache. |
| Daily puzzle changes after refresh | Compare date/difficulty/ID and schedule file checksum | Published file was rewritten or generator/version is not stable | Treat published dates as immutable; publish a new version for rule changes. |
| Completed puzzle disappears immediately | Inspect `complete` and `pruneCompleted` | Cleanup called at completion or retention cutoff is wrong | Completion saves first; retain today and two previous dates. |
| Unfinished puzzle disappears | Inspect `started.json` and cleanup filter | Cleanup is treating “started” as “used” | Retain unfinished records and in-progress WebKit session state. |
| App works after opening but not in background | Inspect BGTask registration, plist identifier, URLSession event handoff | iOS delayed/denied background runtime | Expected limitation; improve scheduling and recovery, never claim guaranteed execution. |
| Website works but app does not | Compare website `dist` schedule path with native `baseURL`; inspect app bundle version | App is using a stale copied bundle or URL | Update the intended Xcode resource and rebuild; do not modify the remote site first. |

### 15.9 Testing requirements for future changes

At minimum, add or preserve tests for:

- Exact 90-date coverage across month/year boundaries and daylight-saving changes.
- Two-previous-date completion retention and cleanup on the third later date.
- Idempotent completion and interrupted install recovery.
- Cache readiness counting all eight records per date.
- Wi-Fi-only behavior at 30 and 29 ready dates.
- Cellular fallback refilling from below 30 to 90.
- Duplicate suppression across Wi-Fi and cellular sessions.
- Envelope checksum, schema, ID, date, board-bound, clue, and word validation failures.
- Local-time date changes without changing a published date’s puzzle identity.
- WebKit bridge responses for `today`, `begin`, and `complete`.
- Offline launch with bundled levels available and daily content unavailable.
- Website/native history reconciliation after backup import.

For manual verification, use a clean simulator state and a second state with an existing unfinished daily attempt. Test both games because they share the bridge but exercise different record shapes. Verify the public schedule independently with an HTTP request before diagnosing a native cache failure.

### 15.10 Security and data-integrity rules

- Treat downloaded JSON as untrusted input, even though it comes from the project’s own site.
- Keep the maximum file size and strict schema checks.
- Reject HTML, script-like clue text, unexpected directions, out-of-bounds coordinates, duplicate IDs, and records for another date.
- Use atomic writes for native JSON files. Mark private cache files excluded from backup where appropriate.
- Do not execute downloaded JavaScript or load downloaded HTML as a web page.
- Do not accept arbitrary native bridge operations or arbitrary URLs from the page.
- Do not store account credentials, signing secrets, GitHub tokens, or deployment tokens in the repository or context file.
- Do not force-push the schedule repository. Use an expected branch head and preserve immutable history.

### 15.11 Explicit non-goals

The following are not implemented and must not be implied by the app:

- Cloud progress synchronization.
- Accounts, authentication, password recovery, or account deletion.
- Public leaderboards or cross-device completion merging.
- Guaranteed execution while the app is force-quit or fully terminated.
- Cellular downloading when the cache has 30 or more ready future dates.
- Regenerating or replacing a published daily puzzle after users may have received it.
- Deleting bundled levels when a daily puzzle is completed.

---

**For an Xcode AI assistant:** Start by identifying whether the task is an app shell or a native rewrite. Read the referenced `dist/` files before implementing game behavior. Preserve the current rules and report any mismatch between this document and source code. Make small, testable changes; verify one game at a time on a compact iPhone simulator and a larger phone before preparing an App Store build.

### Mobile layout refinements (October 2026)

- On phone, both game views occupy the device viewport, paint the cream background through the safe-area edges, and do not scroll the document. Keep the complete board and its controls visible together. The custom on-screen keyboard overlays the page when opened; the operating-system keyboard remains suppressed.
- In Word Links, fit the 15 × 15 board, score, move form, directions, clue controls, and compact challenge summary inside the viewport. Hide the summary only on short screens where it would force the board or controls off-screen.
- The phone Word Links move form uses two distinct 40-pixel rows: the word and Submit action first, then a four-part Up/Down/Left/Right selector. Keep the clue action below a separator with its own spacing; its primary button should be compact, about 140 pixels wide, rather than spanning the panel. The bottom challenge guide must grow to fit its text and keep padding on all sides; shrink the board when needed instead of clipping the guide.
- On taller phones, use otherwise empty lower space for compact game-specific guidance and streak context. Keep it hidden on short screens when it would make the board or entry controls too small.
- In Crossword, fit the 12 × 12 board, across/down selector, one active clue with its triangle dropdown, answer field, previous/next clue buttons, feedback, check action, and progress strip inside the viewport. The answer field mirrors selected-answer letters and opens the custom keyboard at its next empty square. On taller phones, place the challenge/streak card below progress; hide it on short phones. The previous/next buttons move through clues in the selected direction; the clue list does not scroll and does not open a separate all-clues view on phone.
- Use clear vector icons for menus, direction arrows, and navigation controls so they render consistently on iPhone. Keep larger on-screen QWERTY keys and a visible Done control for the custom keyboard.
- Keep the phone header clear of the safe-area edge and leave visible separation between the game title, board, score, and entry controls. Align the score value and unit on one visual baseline; hide only the idle “Connect the two green words to finish” status so real validation and completion messages remain visible.
- On tall phones, the Word Links challenge card must expand naturally and show all its copy. Do not clip the card to a fixed height. Keep it hidden while the custom keyboard is open and on short screens where it would crowd the playable board.
- Keep the Word Links clue trigger visually compact. Style the custom keyboard as part of the site: clear key spacing, readable key faces, press feedback, safe-area padding, and a Done control.
- In the mobile crossword, changing the selected Across or Down clue also updates the active grid answer tracked by the custom keyboard. The answer mirror, selected clue, and active cell must always refer to the same entry.
- Every interactive button across the site has a consistent animated hover response where hover exists and a press response for touch. Respect reduced-motion settings.
- On phones, place the Word Links direction selector and clue controls in separate rows with a visible gap. Keep reroll and easier-clue controls side by side, and inset challenge and guide headings from their card borders.
- On phones, give the crossword grid, direction tabs, active clue, answer field, clue navigation, check control, and progress strip distinct spacing. Size the grid against the remaining viewport height so these controls do not overlap or get clipped.
- Keep the mobile Word Links direction selector in a dedicated two-row-height track in the form; reserve vertical space for it before showing the clue action row. The clue trigger is compact, separated by a fine divider, and the reroll and easier-clue actions share a row. Keep both columns of the challenge/guide card fully inside the card with compact mobile type and padding.

### Mobile viewport pass (November 5, 2026)

- Added a final shared phone-layout override after the earlier responsive rules so later declarations no longer reopen document scrolling.
- Both games now force a `100dvh` play surface with `overflow: hidden`, `overscroll-behavior: none`, safe-area edge padding, and rounded lower corners for the mobile frame.
- Word Links controls use a shared 40px touch target height, consistent gaps, and side clearance. The board, score, entry form, direction selector, clue action, and challenge content are constrained to the viewport.
- Mini Crossword uses the same side clearance and touch sizing, keeps the square board responsive to remaining height, and hides nonessential long-form information on phone so the board and controls remain visible without page scrolling.
- Updated the shared bundle stylesheet cache version and synchronized all 36 bundle assets into the website staging output.
- Verification passed: `node tools/sync-wordlinks-bundle.mjs` and `node tools/verify-website.mjs` (`404` daily files, `32` referenced assets).
- GitHub publishing remains blocked until GitHub Desktop authentication is available; no token or password was stored in the repository.

### Follow-up verification log (November 5, 2026)

- Installed and launched the updated app in the Xcode simulator successfully.
- The device-inspection session ended before returning its screenshot/hierarchy, so visual no-scroll behavior still needs a manual simulator review on Word Links and Mini Crossword.
- Re-attempted `git push origin main` from `/tmp/word-links-push.GZ92tg`; it still failed with `could not read Username for 'https://github.com': Device not configured`.
- Prepared commits remain available in that temporary clone: `f3ce7e9`, `c39a765`, and `9b38299`.

### GitHub authentication follow-up (November 5, 2026)

- Retried the prepared push after the user re-authenticated; it still failed before contacting GitHub.
- This environment has no `gh` executable, no Git credential helper configured, and no GitHub Desktop application at the standard Applications locations.
- Do not request or store a GitHub password or token in this repository. The remaining action is to install/open GitHub Desktop or configure an approved Git credential helper, sign in to GitHub.com, then retry the push from `/tmp/word-links-push.GZ92tg`.
- A later check found Xcode's system Git configuration points to Apple `osxkeychain`, but the keychain returned no GitHub credential. The terminal sandbox also cannot modify the user's global Git config. Re-authenticate GitHub in a client that writes to macOS Keychain, then retry the same push.
- Retried the push with elevated Keychain access; it still failed. A direct read-only `git credential-osxkeychain get` returned no credential, confirming that GitHub Desktop/Xcode login has not stored HTTPS Git credentials for `github.com` on this Mac.
- Retried again after the user re-signed in; the HTTPS push still returned `could not read Username for 'https://github.com': Device not configured`. Stop terminal retries until the prepared repository is opened and pushed directly from GitHub Desktop, or until its Keychain credential is confirmed.
- Checked whether GitHub Desktop could be opened directly; macOS reported `Unable to find application named 'GitHub Desktop'`. It is not installed in the available environment, so direct GUI pushing is unavailable here.
- A later download created `/Users/cadensong/Downloads/GitHub Desktop.app`, but opening it failed with macOS `kLSNoExecutableErr` because the application executable is missing. The download is incomplete/corrupt and cannot authenticate or push.
- The repaired GitHub Desktop app now opens successfully, but `git push` still returns `could not read Username for 'https://github.com'`. The installation is fixed; GitHub Desktop still needs an authenticated account/repository push to populate the credential used by terminal Git.
- Directly opening `/Users/cadensong/Downloads/GitHub Desktop.app` with the prepared repository again returned `kLSNoExecutableErr`; Spotlight finds a stale/incomplete app bundle, so GitHub Desktop cannot actually open the clone or show Push origin.
- The user moved GitHub Desktop into `/Applications`, but opening `/Applications/GitHub Desktop.app` still returns `kLSNoExecutableErr`. The copied app bundle is missing its executable; terminal Git remains unauthenticated.
- A direct bundle inspection now confirms `/Applications/GitHub Desktop.app` contains a valid arm64 Mach-O executable and `Info.plist`. Launching it succeeds without an error, but the prepared push still returns `could not read Username for 'https://github.com'`; authentication is the remaining blocker, not installation or repository state.
- The prepared commits are now published remotely: `git ls-remote` reports `9b382996505a11871e20fd0eb070d492d3bb56c7` on `main`. GitHub’s `Validate Word Links` workflow for that commit completed successfully.
- The user reports six app icons in the simulator. These are expected to be leftover simulator installs from earlier Beacon/Word Links bundle identifiers or prior builds; the project has one real app target, `Word Links`, plus test bundles. Do not delete simulator data without confirming because erase/reset removes simulator progress.
- Cleanup was requested, but `simctl` could not connect to CoreSimulatorService (`connection refused` / runtime service unavailable). No simulator apps or data were deleted. Restart the simulator/Xcode service, enumerate bundle identifiers, and uninstall only the old Beacon/Word Links duplicates.
- A new Xcode device session did not recover CoreSimulatorService; `simctl listapps` still fails with connection refused before returning bundle IDs. The user reports three Word Links icons, but no app will be removed until the simulator service can identify their bundle IDs.
- The online `.github/workflows/generate-daily-schedule.yml` is present and valid with both scheduled and manual triggers. It has not run yet; trigger it manually from GitHub Actions or wait for its scheduled run.
- GitHub Pages has not deployed commit `9b38299` yet; its latest public deployment remains `61fd7aa`, so a Pages 404/stale site at this moment is deployment propagation/configuration, not a missing repository push.

### Repository consolidation (November 6, 2026)

- Canonical local and remote repository: `/Users/cadensong/Documents/Word-Links` → `https://github.com/Cadens0302/Word-Links`.
- The duplicate Xcode folder at `/Users/cadensong/Documents/Coding /Word-Links/Word Links` matched the canonical Swift source, shared bundle, tools, and workflows, but was not a Git checkout.
- The duplicate folder is being archived after verification so future app and website edits happen in the Git-backed canonical project only.
- The canonical Xcode project is `Word Links.xcodeproj`; open it from the repository root before making further changes.
- The project built successfully with tests during consolidation verification.
- Recoverable archives are outside the repository at `/Users/cadensong/Documents/Coding /Word-Links/Word Links.archive-20261106` and `/Users/cadensong/Documents/Word-Links-archive-20261106`.
- Consolidation context is committed locally as `f3c6c4e`; pushing it still requires an authenticated GitHub Desktop session because terminal Git reports `Device not configured`.
- The duplicate temporary clone `/private/tmp/word-links-push.GZ92tg` was verified against the same remote and deleted at the user's request. Keep `/Users/cadensong/Documents/Word-Links` as the sole active repository.
