class HooksUtils
  def self.get_modified_files
    Dir.chdir File.expand_path('../../../', __FILE__)
    `git diff --cached --name-only --diff-filter AM`.split("\n").map(&:chomp).map { |x| File.expand_path("../../../#{x}", __FILE__)}
  end
end
