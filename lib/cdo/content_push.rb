require_relative '../deployment'
require 'cdo/git_utils'
require 'cdo/levelbuilder_content_restrictions'

# This module provides functionality for committing content changes
# to the repository. It encapsulates the logic previously contained in
# the bin/content-push executable script.
#
# This module is used by:
# 1. The bin/content-push wrapper script (for command-line and remote usage)
# 2. The bin/cron/commit_content script (for automated content commits)
# 3. The bin/watch-and-test-levelbuilder script (for automated testing and commits)
# 4. Any other Ruby code that needs to programmatically commit content changes
#
# For the levelbuilder environment, this module also handles filtering files
# to ensure only allowed paths are committed, using the LevelbuilderContentRestrictions module.
#
# Usage:
#   require 'cdo/content_push'
#   ContentPush.commit_and_push('Your Name')
#
module ContentPush
  CONTENT_PATHS = 'dashboard pegasus aws/dms'.freeze
  SCHEMA_FILES = [
    'dashboard/db/schema_cache.yml',
    'dashboard/db/schema.rb',
  ].freeze

  # Check for case-only renames, which can cause issues
  # @return [Boolean] true if no case-only renames were found, false otherwise
  def self.disallow_case_change
    `git add -A #{CONTENT_PATHS}`
    ignore_levelbuilder_schema_changes
    
    case_changes = []
    `git status --porcelain --untracked-files=all #{CONTENT_PATHS}`.split("\n").each do |line|
      if (%r{^R  ([^ ]+) -> ([^ ]+)}.match(line) || %r{^R  ("[^"]+") -> ("[^"]+")}.match(line)) && $1.casecmp($2) == 0
        case_changes << line
      end
    end
    
    unless case_changes.empty?
      case_changes.each do |line|
        warn "\nCase-only rename detected:\n\n    #{line}\n\n"
      end
      
      warn "To fix this, run the following commands for each file:\n\n"
      warn "    git add NEW_FILENAME\n\n"
      warn "    git mv NEW_FILENAME NEW_FILENAME.tmp\n\n"
      warn "    git commit --only OLD_FILENAME NEW_FILENAME.tmp -m 'temporarily rename OLD_FILENAME -> NEW_FILENAME.tmp'\n\n"
      warn "    git mv NEW_FILENAME.tmp NEW_FILENAME\n\n"
      warn "    bin/content-push\n\n"
      
      # unstage all changes so the above instructions can be followed
      `git reset HEAD`
      return false
    end
    
    true
  end

  # Ignore levelbuilder omissions (schema files)
  def self.ignore_levelbuilder_schema_changes
    if GitUtils.current_branch == 'levelbuilder'
      system("git reset -q HEAD -- '#{SCHEMA_FILES.join("' '")}'")
      system("git checkout -q HEAD -- '#{SCHEMA_FILES.join("' '")}'")
    end
  end

  # Filter out files that aren't allowed on levelbuilder
  # @return [Boolean] true if filtering was performed, false otherwise
  def self.filter_levelbuilder_files
    return false unless GitUtils.current_branch == 'levelbuilder'
    
    # Get all modified/untracked files
    all_files = `git status --porcelain --untracked-files=all #{CONTENT_PATHS}`.split("\n")
      .map { |line| line.sub(/^.. /, '') }  # Remove git status prefix
      .map { |path| File.join(deploy_dir, path) }  # Convert to full paths
    
    # Filter out files that aren't allowed
    allowed_files = all_files.select { |file| LevelbuilderContentRestrictions.file_allowed?(file) }
    skipped_files = all_files - allowed_files
    
    # Log skipped files
    unless skipped_files.empty?
      puts "Skipping files not allowed on levelbuilder:"
      skipped_files.each { |file| puts "  #{file}" }
    end
    
    # Stage only allowed files
    allowed_files.each do |file|
      relative_path = file.sub(deploy_dir + '/', '')
      system("git add '#{relative_path}'")
    end
    
    return true
  end

  # Check if there are any changes to commit
  # @return [Boolean] true if there are changes, false otherwise
  def self.has_changes?
    !`git status --porcelain --untracked-files=all #{CONTENT_PATHS}`.empty?
  end

  # Get the status of content changes
  # @return [String] The git status output for content paths
  def self.get_status
    Dir.chdir(deploy_dir) do
      `git status --untracked-files=all #{CONTENT_PATHS}`
    end
  end

  # Commit and push content changes
  # @param name [String] The name to include in the commit message
  # @return [Boolean] true if successful, false otherwise
  def self.commit_and_push(name)
    Dir.chdir(deploy_dir) do
      ignore_levelbuilder_schema_changes
      return true unless has_changes?

      # Check for case-only renames
      return false unless disallow_case_change

      branchname = GitUtils.current_branch
      
      # For levelbuilder, only add allowed files
      if branchname == 'levelbuilder'
        filter_levelbuilder_files
      else
        return false unless system("git add -A #{CONTENT_PATHS}")
      end
      
      return false unless system("git commit -m '#{branchname} content changes (-#{name})'")
      return false unless system("git pull")
      return false unless system("git push")
      
      return true
    end
  end
end
