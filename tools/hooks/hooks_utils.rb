class HooksUtils
  def self.get_modified_files
    Dir.chdir REPO_DIR
    `git diff --cached --name-only --diff-filter AM`.split("\n").map(&:chomp).map { |x| File.expand_path("../../../#{x}", __FILE__)}
  end
end
