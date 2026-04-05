# Jellyfin → Open in IINA

Userscript that adds an **Open in IINA** button to Jellyfin's movie/episode detail pages. Clicking it opens the stream directly in [IINA](https://iina.io/) on macOS.

## How it works

1. Detects Jellyfin via `<meta name="application-name" content="Jellyfin">`.
2. Injects a button into `.mainDetailButtons`.
3. On click: builds the download URL (`/Items/{id}/Download?api_key=…`) and opens `iina://weblink?url=<encoded>`.

## Install the userscript

1. Install [Tampermonkey](https://www.tampermonkey.net/) (or Violentmonkey).
2. Create a new script, paste the contents of `userscript.js`, save.

## (Optional) Skip the "Open IINA?" confirmation

Chromium browsers show an "Open IINA?" dialog every time a page opens a custom protocol. Unlike Firefox, there is no "Remember my choice" option — it prompts on every click.

To suppress it, apply Chrome's [`AutoLaunchProtocolsFromOrigins`](https://chromeenterprise.google/policies/#AutoLaunchProtocolsFromOrigins) policy. The included scripts write this policy via `defaults write` into each browser's macOS preference domain, telling it to silently allow `iina://` from your listed origins.

The origins are **only** for this policy — the userscript itself runs on any Jellyfin instance regardless.

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

## License

[MIT](LICENSE)
