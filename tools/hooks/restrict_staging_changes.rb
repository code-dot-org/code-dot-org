require_relative 'hooks_utils.rb'

REPO_DIR = File.expand_path('../../../', __FILE__).freeze

def main
  Dir.chdir REPO_DIR

  branch_name = `git rev-parse --abbrev-ref HEAD`.strip
  exit(0) unless branch_name == 'staging'

  HooksUtils.get_staged_files.each do |filename|
    raise "STAGING FILE BLOCKED: #{filename}" if HooksUtils.prohibited?(filename)
  end
end

main
