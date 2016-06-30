module GitUtils
  # Returns true if file is different from the committed version in git.
  def self.file_changed_from_git?(file)
    !`git status --porcelain #{file}`.strip.empty?
  end

  # Returns whether any files in this branch or locally changed from base version
  def self.changed_in_branch_or_local?(base_branch, glob_patterns)
    files_changed_in_branch_or_local(base_branch, glob_patterns).empty?
  end

  def self.files_changed_in_branch_or_local(base_branch, glob_patterns)
    files_changed_branch_or_local(base_branch).select do |file_path|
      glob_patterns.any? do |glob|
        RakeUtils.glob_matches_file_path?(glob, file_path)
      end
    end
  end

  def self.files_changed_branch_or_local(base_branch)
    files_changed_locally.concat(files_changed_in_branch(base_branch)).uniq
  end

  # TODO(bcjordan): refactor to de-duplicate with run_tests_if_changed
  def self.build_my_if_changed(test_name, changed_globs)
    max_identifier_length = 12
    justified_test_name = test_name.ljust(max_identifier_length)

    base_branch = current_branch_base
    relevant_changed_files = files_changed_in_branch_or_local(base_branch, changed_globs)
    if relevant_changed_files.empty?
      HipChat.log "Files affecting the #{justified_test_name} build unmodified from #{base_branch}. Using existing build."
    else
      HipChat.log "Files affecting the #{justified_test_name} build *modified* from #{base_branch}. Using 'my' build. Changed files:"
      padding = ' ' * 4
      separator = "\n"
      HipChat.log separator + padding + relevant_changed_files.join(separator + padding)
      yield
    end
  end

  def self.run_tests_if_changed(test_name, changed_globs)
    max_identifier_length = 12
    justified_test_name = test_name.ljust(max_identifier_length)

    base_branch = current_branch_base
    relevant_changed_files = files_changed_in_branch_or_local(base_branch, changed_globs)
    if relevant_changed_files.empty?
      HipChat.log "Files affecting #{justified_test_name} tests unmodified from #{base_branch}. Skipping tests."
    else
      HipChat.log "Files affecting #{justified_test_name} tests *modified* from #{base_branch}. Starting tests. Changed files:"
      padding = ' ' * 4
      separator = "\n"
      HipChat.log separator + padding + relevant_changed_files.join(separator + padding)
      yield
    end
  end


  def self.files_changed_in_branch(base_branch)
    current_branch = self.current_branch
    # via http://stackoverflow.com/a/25071749
    `git --no-pager diff --name-only #{current_branch} $(git merge-base #{current_branch} #{base_branch})`.split("\n")
  end

  def self.files_changed_locally
    staged_changes = `git diff --cached --name-only`.split("\n")
    unstaged_changes = `git diff --name-only`.split("\n")
    staged_changes.concat(unstaged_changes).uniq
  end

  def self.circle_commit_contains?(string)
    latest_commit_message.include?(string)
  end

  def self.current_branch
    `git rev-parse --abbrev-ref HEAD`.strip
  end

  def self.latest_commit_message
    `git log --format=%B -n 1 -1`.strip
  end

  def self.current_branch_base
    branch_to_base(current_branch)
  end

  # Given a branch name, returns its likely base branch / merge destination
  def self.branch_to_base(branch_name)
    case branch_name
      when 'staging'
        'origin/test'
      when 'test'
        'origin/production'
      else # levelbuilder, feature branches, etc.
        'origin/staging'
    end
  end
end
