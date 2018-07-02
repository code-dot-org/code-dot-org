require_relative 'hooks_utils.rb'

REPO_DIR = File.expand_path('../../../', __FILE__).freeze
GITHUB_MAX_FILE_SIZE_BYTES = 100_000_000

def prohibited?(filename)
  File.size(filename) > GITHUB_MAX_FILE_SIZE_BYTES
end

def main
  Dir.chdir REPO_DIR

  HooksUtils.get_staged_files.each do |filename|
    raise "FILE OVER 100MB BLOCKED: #{filename}" if prohibited?(filename)
  end
end

main
