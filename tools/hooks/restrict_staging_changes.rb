require_relative 'hooks_utils.rb'

REPO_DIR = File.expand_path('../../../', __FILE__).freeze

# Returns whether a filename should be prohibited from a staging commit. Reasons for this:
#   * any file with a .mp4 extension
#   * any file with a .mov extension
#   * any file with a .PNG extension (note that .png is allowed)
# @param filename [String] A filename.
# @return [Boolean] Whether the filename should be prohibited in a commit.
def prohibited?(filename)
  ['.mp4', '.mov', '.PNG'].include? File.extname(filename)
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
