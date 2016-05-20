module GitUtils
  # Returns true if file is different from the committed version in git.
  def self.file_changed_from_git?(file)
    !`git status --porcelain #{file}`.strip.empty?
  end

  # Returns whether any files in this branch or locally changed from base version
  def self.changed_in_branch_or_local?(base_branch, glob_patterns)
    files_changed_branch_or_local(base_branch).any? do |file_path|
      glob_patterns.any? do |glob|
        glob_matches_file_path?(glob, file_path)
      end
    end
  end

  def self.files_changed_in_branch_or_local(base_branch, glob_patterns)
    files_changed_branch_or_local(base_branch).select do |file_path|
      glob_patterns.any? do |glob|
        glob_matches_file_path?(glob, file_path)
      end
    end
  end

  def self.glob_matches_file_path?(glob, file_path)
    File.fnmatch?(glob, file_path, File::FNM_PATHNAME | File::FNM_DOTMATCH)
  end

  def self.files_changed_branch_or_local(base_branch)
    files_changed_locally.concat(files_changed_in_branch(base_branch)).uniq
  end

  def self.files_changed_in_branch(base_branch)
    branch_commit = `git merge-base HEAD refs/remotes/origin/#{base_branch}`.strip
    `git diff-tree HEAD #{branch_commit} --name-only`.split("\n")
  end

  def self.files_changed_locally
    staged_changes = `git diff --cached --name-only`.split("\n")
    unstaged_changes = `git diff --name-only`.split("\n")
    staged_changes.concat(unstaged_changes).uniq
  end

  def self.circle_commit_contains?(string)
    circle_commit_message.include?(string)
  end

  def self.current_branch
    `git rev-parse --abbrev-ref HEAD`.strip
  end

  def self.circle_commit_message
    `git log --format=%B -n 1 -1`.strip
  end

  def self.current_branch_base
    branch_to_base(current_branch)
  end

  # Given a branch name, returns its likely base branch / merge destination
  def self.branch_to_base(branch_name)
    case branch_name
      when 'staging'
        'test'
      when 'test'
        'production'
      else # levelbuilder, feature branches, etc.
        'staging'
    end
  end
end
