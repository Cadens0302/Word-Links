# Beacon Wordroom — context for an iPhone app

> **Purpose:** Give an Xcode coding assistant a reliable, detailed description of the existing website and the intended iPhone app. Read this file **and the current `dist/` source** before changing game rules or building native screens. This file is a specification and source map; it is not an iOS project.

## 1. The product in one minute

**Beacon Wordroom** is an independent word-game collection with two games:

1. **Word Links:** Connect two given words on a 15 × 15 letter board by placing valid crossing words. Minimize the total score; each letter in a submitted word costs one point.
2. **Beacon Crossword:** Solve a connected 12 × 12 crossword with numbered Across and Down answers, clues, optional easier clues, and a once-per-puzzle word reveal.

The website has a welcome flow, a difficulty selector, daily challenges, sequential extra levels, separate game histories and streaks, and a puzzle creator with share links. The games use a newspaper-like cream, deep-green, and pale-lime design. The iPhone app should feel like the same product, with touch controls and a complete play view that does not require page scrolling.

**Name and tone:** Use “Beacon Wordroom” for the collection, “Word Links” for game one, and “Beacon Crossword” or “Mini Crossword” for game two. Keep copy friendly, concise, and thoughtful. The site intentionally avoids imitating Wordle.

**Current implementation:** Static HTML, CSS, and vanilla JavaScript in `dist/`; no framework, account system, or server-side game database. The root `index.html` redirects to `dist/`. `.openai/hosting.json` points Sites hosting at `dist`. The live website is `https://word-links-bostonian.cadensong.chatgpt.site/`. An Xcode project does not yet exist in this folder.

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
| `dist/styles.css`, `action-buttons.css`, `custom-puzzles.css`, `age-slider.css`, `game-directions.css`, `motion.css`, `mobile-play.css` | Visual design, mobile layout, interactions, animation. |
| `dist/mobile-play.js` | Phone-specific compact controls, clue sheets, crossword direction tabs and next/previous clue bar, puzzle options. |
| `dist/mobile-keyboard.js` | Touch keyboard for Word Links and Crossword; disables the operating-system keyboard while mobile play is active. |
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

## 7. Beacon Crossword: exact play rules

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
- On a phone, keep the full board, visible **Across** and **Down** section buttons, current clue, **Previous** and **Next** clue controls, feedback, and **Check puzzle** visible without page scrolling. Across/Down select clues in that direction; the full clue lists open in a sheet. A long list may scroll *inside that sheet*, while the player can solve with the visible direction and previous/next controls. Crossword has no diagonal answers.

### Crossword completion and history

- Daily crossword success records the local date and difficulty, then updates the **crossword’s own streak** and history. Level success marks that crossword level complete, unlocks the next, and records level history. Player-made puzzle success has its own completion message and a button back to the real game.
- Crossword currently tracks a filled-letter progress bar/count and solved history. It does **not** use the Word Links points model; do not fabricate a crossword point score in a port.
- Daily and level puzzle input is saved and resumes after the page/tab closes. Custom-puzzle progress is intentionally not added to normal history.

## 8. Daily identity, midnight, and persistence

### Daily puzzle identity

- Daily keys use the **device’s local calendar date** (`YYYY-MM-DD`) rather than UTC. `dist/daily-clock.js` schedules the next local midnight with calendar arithmetic and checks again on focus, page show, and visibility return. In iOS, recalculate on app foreground and after device time/time-zone changes.
- Within the same date, difficulty, and generator version, a daily puzzle must stay the **same on refresh and across devices running the same app version**. Different difficulties get distinct daily puzzles. Its title includes the date and difficulty.
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
- Crossword shows compact masthead/title, full 12 × 12 board, current clue, previous/next, feedback, and Check puzzle. The complete clue list opens in a bottom sheet. Puzzle options similarly open over the game.
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

## 12. Suggested app structure (implementation guidance, not existing code)

The current repository contains a functioning web app, not a native Swift app. For a first Xcode implementation, decide whether to:

1. Bundle the existing `dist/` experience in an app shell and add native handling for safe areas, offline assets, external/shared links, and durable storage; or
2. Build native SwiftUI views with a separately tested game engine that ports the exact generators, validators, clue logic, and persistence schema.

Either route should leave the rules and player history intact. A native rewrite should keep **Word Links** and **Crossword** engines independent, share only the difficulty/date/navigation/persistence infrastructure, and use a versioned `PuzzleID` containing game, mode, difficulty, date or level, and generator version. Separate engine logic from view layout. The giant accepted-word set and authored clue bank should be bundled as read-only app resources so daily generation works offline.

Do not promise cross-device progress without adding a real sync design. If reusing web content in an app, confirm that share links and local storage persist in the chosen web-view configuration. If porting natively, verify deterministic seeded results against the website for representative dates and difficulties before claiming “same daily puzzle.”

### Release preparation still to decide

The folder has **no Xcode project, bundle identifier, app icon, Apple signing configuration, or App Store listing assets**. Those are implementation and publishing inputs, not facts to invent from the website. Keep signing credentials out of source control. Before submission, verify the current Apple review and privacy requirements for the chosen app architecture, and test installation, app suspension/resume, offline launch, sharing/deep links, and saved progress on real devices. A web-view package by itself should not be treated as proof of App Store acceptance.

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
- Daily puzzles are deterministic from local date, difficulty, code version, and local data. People in different time zones change dates at their own midnight.
- The site’s very large Word Links dictionary includes obscure entries, while clue-backed crossword generation uses a much smaller authored pool. The iPhone app should keep those purposes distinct.
- Product wording in a few legacy source names and descriptions still says “age” even though the current UI uses **difficulty**. Use the current player-facing terminology.

---

**For an Xcode AI assistant:** Start by identifying whether the task is an app shell or a native rewrite. Read the referenced `dist/` files before implementing game behavior. Preserve the current rules and report any mismatch between this document and source code. Make small, testable changes; verify one game at a time on a compact iPhone simulator and a larger phone before preparing an App Store build.

### Mobile layout refinements (October 2026)

- On phone, keep game content in normal vertical flow so the Word Links challenge card cannot be clipped by a fixed-height container. The board and move controls come first; the challenge card follows in full below them. Hide the card while the custom keyboard is open, and on very short screens where it would displace the board.
- In Crossword, align the board and clue controls near the game header instead of vertically centering them in a tall empty region. Use the lower space for a compact progress strip on taller phones; omit it on short screens to preserve room for the puzzle.
- The mobile clue sheet has two mutually exclusive tabs: **Horizontal · Across** and **Vertical · Down**. Show one direction’s clue list at a time; scroll within that list. No diagonal crossword entries are supported.
- Use larger on-screen QWERTY keys and clear spacing between keys. Keep the device keyboard suppressed while the custom keyboard is active, with a visible Done control to dismiss it.
