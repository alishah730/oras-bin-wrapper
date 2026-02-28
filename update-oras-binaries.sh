#!/usr/bin/env bash

set -euo pipefail

BIN_DIR="dist/lib"  # Change to 'lib' if you want
mkdir -p "$BIN_DIR"

# 1. Get latest stable (non-prerelease) version
LATEST_VERSION=v$(curl -s https://api.github.com/repos/oras-project/oras/releases \
  | grep -E '"tag_name":' \
  | grep -vE 'beta|rc' \
  | head -n1 \
  | sed -E 's/.*"v([^"]+)".*/\1/')

#LATEST_VERSION="v1.3.0-beta.4"

# Remove leading 'v' for filenames
VERSION_NO_V="${LATEST_VERSION#v}"

echo "Latest ORAS version: $LATEST_VERSION"

# 2. Download binaries
BASE_URL="https://github.com/oras-project/oras/releases/download/$LATEST_VERSION"

PLATFORMS=(
  "windows_amd64"
  "linux_amd64"
  "linux_arm64"
  "darwin_amd64"
  "darwin_arm64"
)
FILES=(
  "oras_${VERSION_NO_V}_windows_amd64.zip"
  "oras_${VERSION_NO_V}_linux_amd64.tar.gz"
  "oras_${VERSION_NO_V}_linux_arm64.tar.gz"
  "oras_${VERSION_NO_V}_darwin_amd64.tar.gz"
  "oras_${VERSION_NO_V}_darwin_arm64.tar.gz"
)

for i in "${!PLATFORMS[@]}"; do
  url="$BASE_URL/${FILES[$i]}"
  dest="$BIN_DIR/${FILES[$i]}"
  echo "Downloading $url ..."
  curl -L -o "$dest" "$url"
done

# 3. Update version in package.json
if command -v jq >/dev/null 2>&1; then
  jq --arg v "$VERSION_NO_V" '.version = $v' package.json > package.tmp.json && mv package.tmp.json package.json
  echo "Updated package.json to version $VERSION_NO_V"
else
  # Fallback: sed (will only work if version is on its own line)
  sed -i.bak -E "s/\"version\": *\"[^\"]+\"/\"version\": \"$VERSION_NO_V\"/" package.json
  echo "Updated package.json to version $VERSION_NO_V (with sed)"
fi

echo "Done."
