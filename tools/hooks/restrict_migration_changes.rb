require 'shellwords'
require_relative 'hooks_utils'

# Enforce our convention that a Rails migration ships in its own isolated
# branch / pull request, separate from any code that uses the new schema.
# Keeping migrations alone makes them trivial to revert and avoids a class of
# ordering problems when a migration and the code depending on it land together.
#
# When the branch's diff against staging contains a migration, the only Ruby
# changes allowed are:
#   * the migration(s) themselves  (dashboard/db/migrate/*.rb)
#   * the regenerated schema dumps (dashboard/db/schema.rb, schema_cache.yml)
#   * annotaterb's "== Schema Information" comment block in model files
#     (dashboard/app/models/**/*.rb) -- but nothing else in those files
#
# Any other added/modified/deleted Ruby (.rb / .rake) file fails the commit.
# This is a hard rule with no override: split the code into its own branch.

REPO_DIR = File.expand_path('../../../', __FILE__).freeze

MIGRATE_PREFIX = 'dashboard/db/migrate/'.freeze
MODELS_PREFIX = 'dashboard/app/models/'.freeze
SCHEMA_FILES = %w(
  dashboard/db/schema.rb
  dashboard/db/schema_cache.yml
).freeze
RUBY_EXTENSIONS = %w(.rb .rake).freeze

# Branches with their own dedicated change rules; never apply this one to them.
EXEMPT_BRANCHES = %w(staging levelbuilder test production).freeze

ERROR_HEADER = <<~MSG.freeze
  MIGRATION BRANCH POLICY: this branch's diff against staging includes a Rails
  migration, so it may only change the migration, the schema dumps, and model
  annotation blocks. The following Ruby file(s) are not allowed here -- move
  them to a separate branch / PR that depends on the migration:
MSG

# Return file content at a git ref ("" for the staged index, e.g. `git show
# :path`), or nil if the file is absent at that ref.
def git_show(ref, path)
  out = `git show #{ref}:#{Shellwords.escape(path)} 2>/dev/null`
  $?.success? ? out : nil
end

# Strip annotaterb's "== Schema Information" comment block so we can compare
# what remains. The block is the run of consecutive comment lines beginning at
# the "# == Schema Information" marker, plus one trailing blank separator line.
def without_annotation_block(content)
  return nil if content.nil?
  lines = content.lines
  start = lines.index {|l| l.lstrip.start_with?('# == Schema Information')}
  return content if start.nil?

  finish = start
  finish += 1 while finish < lines.length && lines[finish].lstrip.start_with?('#')
  finish += 1 if finish < lines.length && lines[finish].strip.empty?
  (lines[0...start] + lines[finish..]).join
end

# A model-file change is permitted only if everything outside the annotation
# block is byte-for-byte identical before and after.
def annotation_only_change?(base_ref, path)
  before = without_annotation_block(git_show(base_ref, path))
  after = without_annotation_block(git_show('', path))
  !before.nil? && !after.nil? && before == after
end

def ruby_file?(path)
  RUBY_EXTENSIONS.include?(File.extname(path))
end

def allowed?(base_ref, path)
  return true if path.start_with?(MIGRATE_PREFIX)
  return true if SCHEMA_FILES.include?(path)
  return annotation_only_change?(base_ref, path) if path.start_with?(MODELS_PREFIX)
  false
end

def main
  Dir.chdir REPO_DIR

  branch_name = `git rev-parse --abbrev-ref HEAD`.strip
  exit(0) if EXEMPT_BRANCHES.include?(branch_name)

  # Diff base: merge-base with staging, so already-merged migrations don't count.
  base = `git merge-base staging HEAD 2>/dev/null`.strip
  base = `git merge-base origin/staging HEAD 2>/dev/null`.strip if base.empty?
  exit(0) if base.empty? # can't establish a base; don't block the commit

  # --cached vs the base reflects the branch as it will be *after* this commit
  # (HEAD's tree plus what is currently staged). --name-status gives us the
  # rename-aware path in the last tab-separated field.
  status = `git diff --cached --name-status #{base}`.split("\n")
  changed = status.map {|line| line.split("\t").last}.compact
  exit(0) if changed.empty?

  has_migration = changed.any? {|f| f.start_with?(MIGRATE_PREFIX) && f.end_with?('.rb')}
  exit(0) unless has_migration

  offenders = changed.select {|path| ruby_file?(path) && !allowed?(base, path)}
  exit(0) if offenders.empty?

  warn ERROR_HEADER
  offenders.sort.each {|path| warn "  - #{path}"}
  warn "\nSee #{__FILE__} for details."
  exit(1)
end

main
