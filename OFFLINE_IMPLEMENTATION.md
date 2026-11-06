# Offline play and account integration status

## Implemented locally
- All game assets remain bundled; no network or account is required in the iOS app.
- The Offline play & backups dialog is available from both games' options.
- Automatic 90-day preparation covers both games and four difficulties using the published daily schedule. Completed daily puzzles remain available for today and the two previous local dates before cleanup.
- Complete puzzle boards are saved in IndexedDB, read back before reporting readiness, and generated without rendering or changing live sessions.
- Existing localStorage saves are retained and mirrored to transactional IndexedDB saves plus an operation journal. Storage failures are surfaced.
- Crossword completion history is no longer capped at 60.
- Portable JSON backup export uses the iOS share sheet; import combines history without duplicating identical records and keeps existing conflicting unfinished sessions. Original imports are retained in IndexedDB for recovery.
- A service worker is included for a future deployment of this bundle over HTTPS. It installs a complete asset release atomically and avoids activating a new release over an open game. It is not deployed to the original website.
- The website service worker caches successfully fetched immutable daily JSON files separately from the versioned shell, so prepared daily files can be reused after a browser reload while offline.
- The website requests persistent browser storage when supported and reports when the browser may clear local progress under storage pressure.

## Deliberate current behavior
- Daily reset remains device-local midnight, matching the existing rules.
- Existing offline daily generation remains available beyond a prepared pack; this is not a server-published editorial schedule.
- This edition produces the same puzzles for the same date and difficulty. Global consistency across different generator versions requires a published immutable schedule and version rollout.
- Guest saves are device-local. The UI does not claim cloud backup.
- Imported conflicting sessions are available under Other saved attempts. Restoring one archives the displaced current attempt before reopening the app. Imports have a rollback journal so interruption cannot leave half the import applied.
- Custom shared puzzle session restoration remains as implemented in the original game; this change does not add it.

## Still required for the full account plan
A real authentication/database project and deployment configuration have not been supplied. Do not ship a simulated login or mark local data as synced.
1. Configure app + website sign-in and account recovery with one backend identity.
2. Add per-account save namespaces, explicit guest adoption, and account switching isolation.
3. Upload operations with stable IDs; acknowledge only committed operations, retry failures, and retain offline access if authentication expires.
4. Store immutable puzzle IDs/editions and attempts separately; merge completions, retain concurrent unfinished attempts, and derive streaks from puzzle dates.
5. Publish a shared upcoming schedule and download manifests, with old editions retained across updates.
6. Implement account deletion/export and recovery; connect website and native authentication callbacks.
7. Deploy the website bundle and validate HTTPS service-worker cold-start/reload offline on supported browsers. Bump the service-worker release when assets change.

## Verification
Xcode build passed. WebKit tests cover deterministic pack generation, preserving active game state, persistence/readback, backup validation, duplicate import, conflicting attempt restoration, merging both games' level progress, rollback of an interrupted import on reload, date arithmetic, existing progress reload, daily identity, and compact/large layouts. The full-year test awaited completion and read back all 365 dates × four difficulties × two games, then checked that a 90-day refresh retained the longer horizon. Tests use the current WebKit contentWorld async overload so storage failures propagate. Simulator verification is tracked in the assistant response. Cross-device/cloud behavior is not implemented or verified.
