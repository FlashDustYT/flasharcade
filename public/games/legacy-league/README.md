# Legacy League

Legacy League is a browser-based sports career life sim prototype designed for desktop and mobile. It runs as a static web app and can also be served as a PWA on localhost or a normal web host.

The current build starts athletes at birth, supports gender and sport emojis, lets players advance by month or year, and limits focus changes to one per in-game month. Year advancement stops early when a major choice event appears.

It also includes cozy mobile/desktop UI updates, career pulse cards, a goal board, preset character builds, streak achievements, and more long-term story events that can change future outcomes.

## Tech Stack

- HTML, CSS, and vanilla JavaScript
- LocalStorage for multiple save slots
- PWA manifest and service worker for hosted/offline use
- Data-driven simulation definitions in `scripts/gameData.js`

This stack was chosen because it runs smoothly on phones, tablets, and desktop browsers without requiring a build step. A larger production version could move the same architecture to React Native with Expo, Flutter, Godot, or a full web/PWA framework.

## Project Structure

```text
legacy-league/
  index.html              App shell
  links.html              Desktop/mobile link helper
  manifest.json           PWA metadata
  service-worker.js       Offline cache when served over HTTP/HTTPS
  start-mobile-server.bat Local Wi-Fi server helper for phone testing
  assets/
    arena.svg             Main visual backdrop
    icon.svg              App icon
  scripts/
    app.js                UI rendering and input handling
    gameData.js           Mod-friendly sports, events, actions, traits
    gameLogic.js          Simulation engine and career rules
    storage.js            Save/load/import/export system
  styles/
    main.css              Responsive mobile and desktop UI
```

## Save Structure

Saves are stored in browser LocalStorage under five numbered slots:

```text
legacy-league-slot-1
legacy-league-slot-2
legacy-league-slot-3
legacy-league-slot-4
legacy-league-slot-5
```

Each save contains:

- `profile`: athlete identity, sport, body, family, personality, genetics
- `timeline`: month, year, age progression
- `career`: stage, ranks, draft stock, contracts, injuries, achievements, legacy
- `ratings`: skill, athleticism, health, discipline, ego, confidence, burnout, social reputation, and relationship systems
- `finance`: cash, wealth, and debt
- `flags`: persistent choices from major events that can affect future outcomes
- `turn`: current month action lock state
- `log`: career timeline entries

## Expanding The Simulation

Add or tune content in `scripts/gameData.js`:

- Add sports, positions, paths, and weight classes in `sports`
- Add life events in `majorEvents`
- Add monthly focuses in `actions`
- Add families and personalities with different stat modifiers
- Add new post-retirement careers in `postCareer`

Keep long-term rules in `scripts/gameLogic.js`:

- Draft, tryout, academy, amateur, and contract rules
- Injury and recovery model
- Finance, tax, debt, and wealth systems
- Retirement and Hall of Fame logic

Keep interface changes in `scripts/app.js` and visual changes in `styles/main.css`.
