#!/usr/bin/env bash
# Applies auto-launch policy for a custom protocol to browsers listed in config.sh.

set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f config.sh ]; then
  echo "Error: scripts/config.sh not found."
  echo "  cp scripts/config.sh.example scripts/config.sh"
  exit 1
fi

source config.sh

for entry in "${BROWSERS[@]}"; do
  bundle_id="${entry%%:*}"
  name="${entry##*:}"
  echo "→ $name ($bundle_id)"
  ./lib/grant-permissions.sh "$PROTOCOL" "$bundle_id" "${ORIGINS[@]}"
done

echo ""
echo "Done. Quit and relaunch each browser, then verify at chrome://policy"
