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

  # Returns whether a filename should be prohibited from a staging commit. Reasons for this:
  #   * any file with an extension in {.mp4, .mov} (e.g., 'dashboard/dir/my_bad_file.mov')
  #   * any file with non-lowercase letters in the extension (e.g., 'dashboard/dir/my_bad_file.PnG')
  #   * any file with spaces in the name
  #   * any file in /code.org/public/images/avatars with non-lowercase letters in the filename
  # @param filename [String] A filename.
  # @return [Array<String>, Boolean] An array of error messages if the file is prohibited for one or more reasons; `false` otherwise
  def self.prohibited?(filename)
    problems = []
    problems << "file uses a .mp4 or .mov extension" if ['.mp4', '.mov'].include? File.extname(filename)
    problems << "non-lowercase characters in extension" if File.extname(filename) != File.extname(filename).downcase
    problems << "spaces in filename" if filename.match?(/\s/)
    problems << "non-lowercase characters in avatar image" if filename.include?('/code.org/public/images/avatars/') && File.basename(filename).downcase != File.basename(filename)
    return problems unless problems.empty?
    return false
  end
end
