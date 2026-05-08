#!/usr/bin/env bash
#
# Downloads oras CLI binaries for all supported platforms.
# Usage:
#   ./update-oras-binaries.sh          # fetches latest stable version
#   ./update-oras-binaries.sh 1.3.1    # fetches a specific version
#
set -euo pipefail

LIB_DIR="lib"
mkdir -p "$LIB_DIR"

# Determine version: argument > latest stable release
if [[ ${1:-} != "" ]]; then
  VERSION_NO_V="${1#v}"
else
  VERSION_NO_V=$(curl -s https://api.github.com/repos/oras-project/oras/releases \
    | grep -E '"tag_name":' \
    | grep -vE 'beta|rc' \
    | head -n1 \
    | sed -E 's/.*"v([^"]+)".*/\1/')
fi

echo "ORAS version: v${VERSION_NO_V}"

BASE_URL="https://github.com/oras-project/oras/releases/download/v${VERSION_NO_V}"

FILES=(
  "oras_${VERSION_NO_V}_windows_amd64.zip"
  "oras_${VERSION_NO_V}_linux_amd64.tar.gz"
  "oras_${VERSION_NO_V}_linux_arm64.tar.gz"
  "oras_${VERSION_NO_V}_darwin_amd64.tar.gz"
  "oras_${VERSION_NO_V}_darwin_arm64.tar.gz"
)

# Clean existing archives
rm -f "$LIB_DIR"/oras_*.tar.gz "$LIB_DIR"/oras_*.zip

for file in "${FILES[@]}"; do
  echo "Downloading ${file} ..."
  curl -fSL -o "$LIB_DIR/${file}" "$BASE_URL/${file}"
done

echo "Done. Binaries saved to $LIB_DIR/"
