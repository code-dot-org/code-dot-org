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

log() {
  printf '%s\n' "$*"
}

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

git_exclude_file() {
  git rev-parse --git-path info/exclude
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
  safe_symlink "sdd-experiment/speckit/.specify" ".specify"

  if [ -e "$tool_dir/specs" ]; then
    log "Linking Speckit specs..."
    safe_symlink "sdd-experiment/speckit/specs" "specs"
  else
    log "Speckit specs directory not present yet; skipping specs symlink."
  fi

  local skill
  for skill in "${SPECKIT_SKILLS[@]}"; do
    ensure_target_exists "$tool_dir/.agents/skills/$skill"
    log "Linking $skill..."
    safe_symlink "../../../sdd-experiment/speckit/.agents/skills/$skill" ".agents/skills/$skill"
  done
}

install_openspec() {
  local tool_dir="$REPO_DIR/openspec"

  ensure_target_exists "$tool_dir"

  if [ -e "$tool_dir/specs" ]; then
    log "Linking OpenSpec specs..."
    safe_symlink "sdd-experiment/openspec/specs" "specs"
  else
    log "OpenSpec specs directory not present yet; skipping specs symlink."
  fi

  # Add future openspec-specific root links here when defined.
  # Example:
  # if [ -e "$tool_dir/openspec" ]; then
  #   log "Linking openspec..."
  #   safe_symlink "sdd-experiment/openspec/openspec" "openspec"
  # fi
}

ensure_excludes() {
  ensure_local_exclude "sdd-experiment/"
  ensure_local_exclude ".specify"
  ensure_local_exclude "specs"
  ensure_local_exclude "openspec"

  local skill
  for skill in "${SPECKIT_SKILLS[@]}"; do
    ensure_local_exclude ".agents/skills/$skill"
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
  openspec  Placeholder; update install_openspec() once layout is defined
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
