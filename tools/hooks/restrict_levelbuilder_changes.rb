require_relative 'hooks_utils.rb'

REPO_DIR = File.expand_path('../../../', __FILE__)
LEVELS_DIR = File.expand_path(REPO_DIR + '/dashboard/config/scripts', __FILE__)

Dir.chdir REPO_DIR
branchname = `git rev-parse --abbrev-ref HEAD`.strip

exit(0) unless branchname == 'levelbuilder'
modified_files = HooksUtils.get_modified_files REPO_DIR

modified_files.each do |filename|
  raise 'Levelbuilder branch should only commit files in levels directory' unless filename.start_with? LEVELS_DIR
end
