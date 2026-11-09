#!/usr/bin/env bash
set -euo pipefail

REPO_URL="git@github.com:code-dot-org/sdd-experiment.git"
REPO_DIR="sdd-experiment"
REPO_BRANCH="main"

TOOL="${1:-speckit}"

SPECKIT_SKILLS=(
  speckit-analyze
  speckit-checklist
  speckit-clarify
  speckit-constitution
  speckit-implement
  speckit-plan
  speckit-specify
  speckit-tasks
  speckit-taskstoissues
)

OPENSPEC_SKILLS=(
  openspec-apply-change
  openspec-archive-change
  openspec-explore
  openspec-propose
)

OPENSPEC_COMMANDS=(
  apply
  archive
  explore
  propose
)

log() {
  printf '%s\n' "$*"
}

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

git_exclude_file() {
  local repo_root

  [ -e "$REPO_DIR" ] || fail "$REPO_DIR does not exist"
  repo_root="$(git -C "$REPO_DIR" rev-parse --show-toplevel 2>/dev/null)" \
    || fail "$REPO_DIR is not inside a git worktree"

  git -C "$repo_root" rev-parse --git-path info/exclude
}

ensure_repo() {
  if [ ! -e "$REPO_DIR" ]; then
    log "Cloning $REPO_URL into $REPO_DIR..."
    git clone --branch "$REPO_BRANCH" "$REPO_URL" "$REPO_DIR"
    return
  fi

  if [ ! -d "$REPO_DIR/.git" ] && [ ! -f "$REPO_DIR/.git" ]; then
    fail "$REPO_DIR exists but is not a git repo"
  fi

  log "Updating $REPO_DIR..."
  git -C "$REPO_DIR" fetch origin
  git -C "$REPO_DIR" checkout "$REPO_BRANCH"
  git -C "$REPO_DIR" pull --ff-only origin "$REPO_BRANCH"
}

ensure_target_exists() {
  local path="$1"
  [ -e "$path" ] || fail "expected path not found: $path"
}

safe_remove_path() {
  local path="$1"

  if [ -L "$path" ]; then
    rm -f "$path"
    return
  fi

  if [ -e "$path" ]; then
    fail "refusing to remove non-symlink path: $path"
  fi
}

safe_symlink() {
  local source="$1"
  local target="$2"

  if [ -L "$target" ]; then
    rm -f "$target"
  elif [ -e "$target" ]; then
    fail "target exists and is not a symlink: $target"
  fi

  ln -s "$source" "$target"
}

ensure_local_exclude() {
  local pattern="$1"
  local exclude_file

  exclude_file="$(git_exclude_file)"
  mkdir -p "$(dirname "$exclude_file")"
  touch "$exclude_file"

  if ! grep -qxF "$pattern" "$exclude_file"; then
    printf '%s\n' "$pattern" >> "$exclude_file"
  fi
}

cleanup_speckit_overlay() {
  log "Cleaning existing Speckit overlay..."
  safe_remove_path ".specify"
  safe_remove_path "specs"

  local skill
  for skill in "${SPECKIT_SKILLS[@]}"; do
    safe_remove_path ".agents/skills/$skill"
  done
}

cleanup_openspec_overlay() {
  log "Cleaning existing OpenSpec overlay..."
  safe_remove_path "openspec"
  safe_remove_path "specs"
  safe_remove_path ".claude/commands/opsx"

  local skill cmd
  for skill in "${OPENSPEC_SKILLS[@]}"; do
    safe_remove_path ".agents/skills/$skill"
    safe_remove_path ".github/skills/$skill"
  done
  for cmd in "${OPENSPEC_COMMANDS[@]}"; do
    safe_remove_path ".github/prompts/opsx-$cmd.prompt.md"
  done
}

cleanup_all_overlays() {
  mkdir -p .agents/skills
  cleanup_speckit_overlay
  cleanup_openspec_overlay
}

install_speckit() {
  local tool_dir="$REPO_DIR/speckit"

  ensure_target_exists "$tool_dir/.specify"
  ensure_target_exists "$tool_dir/.agents/skills"

  mkdir -p .agents/skills

  log "Linking Speckit .specify..."
  safe_symlink "$REPO_DIR/speckit/.specify" ".specify"

  if [ -e "$tool_dir/specs" ]; then
    log "Linking Speckit specs..."
    safe_symlink "$REPO_DIR/speckit/specs" "specs"
  else
    log "Speckit specs directory not present yet; skipping specs symlink."
  fi

  local skill
  for skill in "${SPECKIT_SKILLS[@]}"; do
    ensure_target_exists "$tool_dir/.agents/skills/$skill"
    log "Linking $skill..."
    safe_symlink "../../$REPO_DIR/speckit/.agents/skills/$skill" ".agents/skills/$skill"
  done
}

install_openspec() {
  local tool_dir="$REPO_DIR/openspec"

  ensure_target_exists "$tool_dir"
  ensure_target_exists "$tool_dir/.agents/skills"
  ensure_target_exists "$tool_dir/.claude/commands/opsx"
  ensure_target_exists "$tool_dir/.github/prompts"
  ensure_target_exists "$tool_dir/.github/skills"
  ensure_target_exists "$tool_dir/openspec"

  mkdir -p .agents/skills .claude/commands .github/prompts .github/skills

  log "Linking OpenSpec working dir..."
  safe_symlink "$REPO_DIR/openspec/openspec" "openspec"

  log "Linking OpenSpec slash commands..."
  safe_symlink "../../$REPO_DIR/openspec/.claude/commands/opsx" ".claude/commands/opsx"

  if [ -e "$tool_dir/specs" ]; then
    log "Linking OpenSpec specs..."
    safe_symlink "$REPO_DIR/openspec/specs" "specs"
  else
    log "OpenSpec specs directory not present yet; skipping specs symlink."
  fi

  local skill cmd
  for skill in "${OPENSPEC_SKILLS[@]}"; do
    ensure_target_exists "$tool_dir/.agents/skills/$skill"
    ensure_target_exists "$tool_dir/.github/skills/$skill"
    log "Linking $skill..."
    safe_symlink "../../$REPO_DIR/openspec/.agents/skills/$skill" ".agents/skills/$skill"
    safe_symlink "../../$REPO_DIR/openspec/.github/skills/$skill" ".github/skills/$skill"
  done

  for cmd in "${OPENSPEC_COMMANDS[@]}"; do
    ensure_target_exists "$tool_dir/.github/prompts/opsx-$cmd.prompt.md"
    log "Linking opsx-$cmd prompt..."
    safe_symlink "../../$REPO_DIR/openspec/.github/prompts/opsx-$cmd.prompt.md" ".github/prompts/opsx-$cmd.prompt.md"
  done
}

ensure_excludes() {
  ensure_local_exclude "$REPO_DIR/"
  ensure_local_exclude ".specify"
  ensure_local_exclude "specs"
  ensure_local_exclude "openspec"
  ensure_local_exclude ".claude/commands/opsx"

  local skill cmd
  for skill in "${SPECKIT_SKILLS[@]}"; do
    ensure_local_exclude ".agents/skills/$skill"
  done
  for skill in "${OPENSPEC_SKILLS[@]}"; do
    ensure_local_exclude ".agents/skills/$skill"
    ensure_local_exclude ".github/skills/$skill"
  done
  for cmd in "${OPENSPEC_COMMANDS[@]}"; do
    ensure_local_exclude ".github/prompts/opsx-$cmd.prompt.md"
  done
}

print_usage() {
  cat <<'EOF'
Usage:
  experimental/sdd-overlay.sh [speckit|openspec]

Behavior:
  - Clones or updates sdd-experiment
  - Removes symlinked overlay paths from other SDD tools
  - Installs the selected tool overlay
  - Adds local git excludes for overlay-created symlinks

Current tools:
  speckit   Supported
  openspec  Supported
EOF
}

main() {
  case "$TOOL" in
    speckit|openspec)
      ;;
    -h|--help|help)
      print_usage
      exit 0
      ;;
    *)
      fail "unknown tool: $TOOL"
      ;;
  esac

  ensure_repo
  cleanup_all_overlays

  case "$TOOL" in
    speckit)
      install_speckit
      ;;
    openspec)
      install_openspec
      ;;
  esac

  ensure_excludes

  log "Done."
  log "Selected tool: $TOOL"
  log "Exclude file: $(git_exclude_file)"
}

main "$@"
