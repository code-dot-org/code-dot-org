class HooksUtils
  def self.get_modified_files(repo_directory)
    Dir.chdir repo_directory
    `git diff --cached --name-only --diff-filter AM`.split("\n").map(&:chomp).map { |x| File.expand_path("../../../#{x}", __FILE__)}
  end
end
