require_relative 'hooks_utils'

REPO_DIR = File.expand_path('../../../', __FILE__).freeze

def main
  Dir.chdir REPO_DIR

  branch_name = `git rev-parse --abbrev-ref HEAD`.strip
  exit(0) unless branch_name == 'staging'

  HooksUtils.get_staged_files.each do |filename|
    prohibition_problems = HooksUtils.prohibited?(filename)
    raise "STAGING FILE BLOCKED: #{filename} (#{prohibition_problems.join(', ')})" if prohibition_problems
  end
end

main
