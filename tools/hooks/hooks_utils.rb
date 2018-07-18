class HooksUtils
  def self.get_modified_files
    Dir.chdir File.expand_path('../../../', __FILE__)
    `git ls-files --exclude-standard --modified`.split("\n").map(&:chomp).map {|x| File.expand_path("../../../#{x}", __FILE__)}
  end

  def self.get_unstaged_files
    Dir.chdir File.expand_path('../../../', __FILE__)
    `git ls-files --exclude-standard --others`.split("\n").map(&:chomp).map {|x| File.expand_path("../../../#{x}", __FILE__)}
  end

  def self.get_staged_files
    Dir.chdir File.expand_path('../../../', __FILE__)
    `git diff --cached --name-only --diff-filter AMR`.split("\n").map(&:chomp).map {|x| File.expand_path("../../../#{x}", __FILE__)}
  end
end
