#!/usr/bin/env bash
# Copy the plugin build into the fixture vault so it can be opened in Obsidian.
#
#   scripts/install-fixture.sh          copy build into fixtures/vault
#   scripts/install-fixture.sh --reset  also restore the vault's notes to their committed state first
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
vault="$root/fixtures/vault"
dest="$vault/.obsidian/plugins/clean-tracker"

if [[ "${1:-}" == "--reset" ]]; then
  git -C "$root" restore --source=HEAD --staged --worktree -- fixtures/vault
  git -C "$root" clean -fdq -- fixtures/vault
  echo "Reset fixtures/vault to HEAD"
fi

mkdir -p "$dest"
for f in main.js manifest.json styles.css; do
  if [[ -f "$root/$f" ]]; then
    cp "$root/$f" "$dest/"
    echo "Copied $f"
  elif [[ "$f" != styles.css ]]; then
    echo "Missing $f in $root" >&2
    exit 1
  fi
done

# Obsidian's hot-reload plugin picks up changes when this marker is present.
touch "$dest/.hotreload"

echo "Installed into $dest"
