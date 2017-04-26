require_relative 'hooks_utils.rb'

REPO_DIR = File.expand_path('../../../', __FILE__).freeze

# Returns whether a filename should be prohibited from a staging commit. Reasons for this:
#   * any mp4 extension file
# @param filename [String] A filename.
# @return [Boolean] Whether the filename should be prohibited in a commit.
def prohibited?(filename)
  return true if Filename.extname(filename) == '.mp4'
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
