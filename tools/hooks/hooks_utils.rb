class HooksUtils
  def self.get_modified_files
    Dir.chdir File.expand_path('../../../', __FILE__)
    sanitize_file_paths(`git ls-files --exclude-standard --modified`)
  end

  def self.get_unstaged_files
    Dir.chdir File.expand_path('../../../', __FILE__)
    sanitize_file_paths(`git ls-files --exclude-standard --others`)
  end

  def self.get_staged_files
    Dir.chdir File.expand_path('../../../', __FILE__)
    sanitize_file_paths(`git diff --cached --name-only --diff-filter AMR`)
  end

  def self.get_changed_files_between_branches(first_branch, second_branch)
    Dir.chdir File.expand_path('../../../', __FILE__)
    sanitize_file_paths(`git diff --name-only #{first_branch}...#{second_branch}`)
  end

  class << self
    private def sanitize_file_paths(output)
      return output.split("\n").map(&:chomp).map {|x| File.expand_path("../../../#{x}", __FILE__)}
    end
  end
end
