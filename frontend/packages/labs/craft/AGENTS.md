# Craft Lab

Game engine package at `frontend/packages/labs/craft/`. Phaser CE 2.x,
migrated from standalone repo.

- Source is mostly untyped JS (`allowJs: true`, `@ts-nocheck` on legacy files).
  Only touch types on public API surfaces unless converting a file wholesale.
- `README.md` documents the public API and dev commands. Keep it current.
- Assets in `src/assets/` are Git LFS. Atlas JSON files are binary-coupled
  to their PNGs — always update both together.
