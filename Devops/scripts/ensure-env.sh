#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"

copy_if_missing() {
  example_path="$1"
  target_path="$2"

  if [ ! -f "$example_path" ]; then
    echo "[skip] Missing template: $example_path"
    return 0
  fi

  if [ -f "$target_path" ]; then
    echo "[ok] Exists: $target_path"
    return 0
  fi

  cp "$example_path" "$target_path"
  echo "[created] $target_path (from $example_path)"
}

copy_if_missing "$ROOT_DIR/Backend/.env.example" "$ROOT_DIR/Backend/.env"
copy_if_missing "$ROOT_DIR/Frontend/.env.example" "$ROOT_DIR/Frontend/.env"

echo "Done ensuring .env files."
