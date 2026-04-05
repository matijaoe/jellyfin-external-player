#!/usr/bin/env bash
# Grant auto-launch permission for an external player's URL scheme on a Chromium browser
# via the AutoLaunchProtocolsFromOrigins enterprise policy.
# The protocol (e.g. "iina") is driven by the userscript's configured player.
#
# Usage: ./grant-permissions.sh <protocol> <bundle-id> <origin1> [origin2] [...]

set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <protocol> <bundle-id> <origin1> [origin2] [...]"
  exit 1
fi

protocol="$1"
bundle_id="$2"
shift 2

origins_xml=""
for origin in "$@"; do
  origins_xml+="    <string>${origin}</string>"$'\n'
done

defaults write "$bundle_id" AutoLaunchProtocolsFromOrigins -array "
<dict>
  <key>protocol</key>
  <string>${protocol}</string>
  <key>allowed_origins</key>
  <array>
${origins_xml}  </array>
</dict>
"

echo "✅ ${protocol}:// policy set for ${bundle_id}"
