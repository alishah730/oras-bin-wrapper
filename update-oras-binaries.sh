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

CURL_COMMON_ARGS=(
  -fsSL
  --retry 3
  --retry-delay 2
  -H "Accept: application/vnd.github+json"
  -H "X-GitHub-Api-Version: 2022-11-28"
)

if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  CURL_COMMON_ARGS+=( -H "Authorization: Bearer ${GITHUB_TOKEN}" )
fi

resolve_latest_version() {
  local version

  # Prefer the latest endpoint to avoid relying on list ordering.
  version=$(curl "${CURL_COMMON_ARGS[@]}" \
    "https://api.github.com/repos/oras-project/oras/releases/latest" \
    | sed -nE 's/.*"tag_name"[[:space:]]*:[[:space:]]*"v?([^"]+)".*/\1/p' \
    | head -n1)

  if [[ -z "${version}" ]]; then
    # Fallback to the releases list and pick first stable tag.
    version=$(curl "${CURL_COMMON_ARGS[@]}" \
      "https://api.github.com/repos/oras-project/oras/releases" \
      | grep -E '"tag_name"' \
      | grep -vE 'beta|rc' \
      | sed -nE 's/.*"v?([^"]+)".*/\1/p' \
      | head -n1)
  fi

  if [[ -z "${version}" ]]; then
    echo "Error: could not resolve latest ORAS version from GitHub API." >&2
    exit 1
  fi

  printf '%s\n' "${version}"
}

# Determine version: argument > latest stable release
if [[ ${1:-} != "" ]]; then
  VERSION_NO_V="${1#v}"
else
  VERSION_NO_V=$(resolve_latest_version)
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
  curl "${CURL_COMMON_ARGS[@]}" -o "$LIB_DIR/${file}" "$BASE_URL/${file}"
done

echo "Done. Binaries saved to $LIB_DIR/"
