require_relative 'hooks_utils.rb'

REPO_DIR = File.expand_path('../../../', __FILE__)
LEVELS_DIR = File.expand_path(REPO_DIR + '/dashboard/config/scripts', __FILE__)
WHITELISTED_FILES = %w[dashboard/config/locales/dsls.en.yml dashboard/config/locales/scripts.en.yml].map{|f| File.join(REPO_DIR, f)}
ERROR_MESSAGE = "Levelbuilder branch should only commit files in levels directory and specific whitelisted files. See #{__FILE__} for details."

Dir.chdir REPO_DIR
branchname = `git rev-parse --abbrev-ref HEAD`.strip

exit(0) unless branchname == 'levelbuilder'
modified_files = HooksUtils.get_modified_files

modified_files.each do |filename|
  raise "#{ERROR_MESSAGE}\nFile blocked: #{filename}" unless filename.start_with?(LEVELS_DIR) || WHITELISTED_FILES.include?(filename)
end
