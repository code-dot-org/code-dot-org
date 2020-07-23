require_relative 'hooks_utils.rb'

REPO_DIR = File.expand_path('../../../', __FILE__).freeze

# Returns whether a filename should be prohibited from a staging commit. Reasons for this:
#   * any file with an extension in {.mp4, .mov} (e.g., 'dashboard/dir/my_bad_file.mov')
#   * any file with non-lowercase letters in the extension (e.g., 'dashboard/dir/my_bad_file.PnG')
#   * any file with spaces in the name
#   * any file in /code.org/public/images/avatars with non-lowercase letters in the filename
# @param filename [String] A filename.
# @return [Boolean] Whether the filename should be prohibited in a commit.
def prohibited?(filename)
  return true if ['.mp4', '.mov'].include? File.extname(filename)
  return true if File.extname(filename) != File.extname(filename).downcase
  return true if filename.include?(' ')
  return true if filename.include?('/code.org/public/images/avatars/') && File.basename(filename).downcase != File.basename(filename)
  false
end

def main
  Dir.chdir REPO_DIR

  branch_name = `git rev-parse --abbrev-ref HEAD`.strip
  exit(0) unless branch_name == 'staging'

  HooksUtils.get_staged_files.each do |filename|
    raise "STAGING FILE BLOCKED: #{filename}" if prohibited?(filename)
  end
end

main
