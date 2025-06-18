require_relative '../deployment'

# This module provides shared functionality for restricting content changes
# in the levelbuilder environment. It centralizes the path restriction logic
# that was previously duplicated across multiple files.
#
# This module is used by:
# 1. The pre-commit hook (tools/hooks/restrict_levelbuilder_changes.rb)
# 2. The ContentPush module (lib/cdo/content_push.rb)
# 3. Any other code that needs to validate files against levelbuilder restrictions
#
# The module defines which paths and files are allowed to be committed to the
# levelbuilder branch, and provides methods to validate files against these
# restrictions.
#
# Usage:
#   require 'cdo/levelbuilder_content_restrictions'
#   LevelbuilderContentRestrictions.file_allowed?(filename)
#   # or
#   result = LevelbuilderContentRestrictions.validate_files(files)
#   unless result[:valid]
#     puts result[:message]
#   end
#
module LevelbuilderContentRestrictions
  REPO_DIR = File.expand_path('../../../', __FILE__).freeze

  # Define allowed paths for levelbuilder
  ALLOWED_PATHS = [
    File.join(REPO_DIR, 'dashboard/config/blocks'),
    File.join(REPO_DIR, 'dashboard/config/shared_functions'),
    File.join(REPO_DIR, 'dashboard/config/libraries'),
    File.join(REPO_DIR, 'dashboard/config/scripts'),
    File.join(REPO_DIR, 'dashboard/config/levels'),
    File.join(REPO_DIR, 'dashboard/config/courses'),
    File.join(REPO_DIR, 'dashboard/config/course_offerings'),
    File.join(REPO_DIR, 'dashboard/config/data_docs'),
    File.join(REPO_DIR, 'dashboard/config/reference_guides'),
    File.join(REPO_DIR, 'dashboard/config/programming_classes'),
    File.join(REPO_DIR, 'dashboard/config/programming_environments'),
    File.join(REPO_DIR, 'dashboard/config/programming_expressions'),
    File.join(REPO_DIR, 'dashboard/public/c/video_thumbnails'),
    File.join(REPO_DIR, 'dashboard/config/foorm')
  ].freeze
  
  ALLOWED_FILES = [
    File.join(REPO_DIR, 'dashboard/config/locales/dsls/en.yml'),
    File.join(REPO_DIR, 'dashboard/config/locales/scripts/en.yml'),
    File.join(REPO_DIR, 'dashboard/config/locales/courses/en.yml'),
    File.join(REPO_DIR, 'dashboard/config/locales/unplugged/en.yml'),
    File.join(REPO_DIR, 'dashboard/config/locales/data/en.yml'),
    File.join(REPO_DIR, 'dashboard/config/videos.csv')
  ].freeze
  
  # Error message for levelbuilder restrictions
  ERROR_MESSAGE = "Levelbuilder branch should only commit files in allowed directories and specific allowed files. See #{__FILE__} for details.".freeze

  # Validate if a file is allowed for levelbuilder
  def self.file_allowed?(filename)
    ALLOWED_PATHS.any? { |path| filename.start_with?(path) } ||
      ALLOWED_FILES.include?(filename)
  end
  
  # Validate a list of files for levelbuilder
  # @param files [Array<String>] List of file paths to validate
  # @return [Hash] Result of validation with keys :valid, :invalid_files, and :message
  def self.validate_files(files)
    invalid_files = files.reject { |file| file_allowed?(file) }
    
    if invalid_files.empty?
      { valid: true }
    else
      {
        valid: false,
        invalid_files: invalid_files,
        message: "#{ERROR_MESSAGE}\nInvalid files: #{invalid_files.join(', ')}"
      }
    end
  end
  
  # Get the current Git branch name
  # @return [String] Current branch name
  def self.current_branch
    `git rev-parse --abbrev-ref HEAD`.strip
  end
  
  # Check if current branch is levelbuilder
  # @return [Boolean] True if current branch is levelbuilder
  def self.levelbuilder_branch?
    current_branch == 'levelbuilder'
  end
  
  # Get staged files for the current Git repository
  # @return [Array<String>] List of staged file paths
  def self.get_staged_files
    Dir.chdir(REPO_DIR)
    `git diff --cached --name-only --diff-filter AMR`.split("\n").map do |path|
      File.join(REPO_DIR, path)
    end
  end
end
