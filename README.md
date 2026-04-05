# Jellyfin → Open in External Player

Userscript that adds a button to Jellyfin item detail pages that opens the stream in a native desktop player. Ships with [IINA](https://iina.io/) as the default and only verified player.

## How it works

1. Detects Jellyfin via `<meta name="application-name" content="Jellyfin">`.
2. Injects a button into `.mainDetailButtons`.
3. On click: reads `ApiClient.accessToken()` and the item ID from `location.hash`, builds the download URL (`/Items/{id}/Download?api_key=…`), and hands it off to the configured player's URL scheme.

The player is determined by the `PLAYERS` registry at the top of `userscript.js`. The default entry uses `iina://weblink?url={URL}`.

## Install the userscript

1. Install [Tampermonkey](https://www.tampermonkey.net/) (or Violentmonkey).
2. Create a new script, paste the contents of `userscript.js`, save.

## Keyboard shortcut

The userscript registers a global shortcut (default **⌃⌥⌘I**) that fires the same action as the button. It only triggers on Jellyfin detail pages where the button is visible, and is suppressed when an input field is focused.

Both the key combo and whether the shortcut is enabled at all are configurable in the `CONFIG.shortcut` block near the top of `userscript.js`.

## (Optional) Auto-launch permission on macOS Chromium browsers

Chromium browsers show an "Open [app]?" dialog every time a page opens a custom URL scheme. Unlike Firefox, there is no "Remember my choice" option — it prompts on every click.

To suppress it, apply Chrome's [`AutoLaunchProtocolsFromOrigins`](https://chromeenterprise.google/policies/#AutoLaunchProtocolsFromOrigins) policy. The included scripts write this policy via `defaults write` into each browser's macOS preference domain, telling it to silently allow the player's URL scheme from your listed origins.

The origins are **only** for this browser policy — the userscript itself runs on any Jellyfin instance regardless.

```bash
cp scripts/config.sh.example scripts/config.sh
# Edit config.sh — set your Jellyfin URLs and uncomment your browsers
chmod +x scripts/*.sh
./scripts/setup-browsers.sh
```

Quit each browser (⌘Q), relaunch, and verify at `chrome://policy`.

The script is idempotent — it **replaces** the policy each run with exactly what's in `config.sh`. Safe to re-run after editing.

> **Firefox**: prompts with a "Remember my choice" checkbox. No policy needed.
>
> **Safari**: prompts every time with no way to suppress it.

If your browser isn't listed in `config.sh.example`, find its bundle ID with:

```bash
osascript -e 'id of app "Browser Name"'
```

#### Removing the policy

```bash
defaults delete <bundle-id> AutoLaunchProtocolsFromOrigins
```

## Adding another player

The `PLAYERS` registry at the top of `userscript.js` maps player keys to their configuration:

```javascript
const PLAYERS = {
  iina: { name: 'IINA', icon: 'launch', template: 'iina://weblink?url={URL}' },
};
```

Each entry has three fields:

- **`name`** — display name shown in the button tooltip.
- **`icon`** — a [Material Icons](https://fonts.google.com/icons) name for the button.
- **`template`** — the URL scheme with `{URL}` as a placeholder for the percent-encoded stream URL.

To add a player, add an entry and point `PLAYER` at it. For example, VLC or mpv could be added if their URL schemes are known — but scheme registration varies by app, install method, and macOS version, so you're responsible for verifying the scheme actually launches the app on your system. Only IINA has been verified.

If you add a player with a different URL scheme, update `PROTOCOL` in `scripts/config.sh` to match so the auto-launch policy covers it.

## License

[MIT](LICENSE)
