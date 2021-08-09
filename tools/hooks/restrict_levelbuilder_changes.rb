require_relative 'hooks_utils.rb'

REPO_DIR = File.expand_path('../../../', __FILE__).freeze
BLOCKS_DIR = File.expand_path(REPO_DIR + '/dashboard/config/blocks', __FILE__).freeze
SHARED_FUNCTIONS_DIR = File.expand_path(REPO_DIR + '/dashboard/config/shared_functions', __FILE__).freeze
LIBRARIES_DIR = File.expand_path(REPO_DIR + '/dashboard/config/libraries', __FILE__).freeze
LEVELS_DIR = File.expand_path(REPO_DIR + '/dashboard/config/scripts', __FILE__).freeze
COURSES_DIR = File.expand_path(REPO_DIR + '/dashboard/config/courses', __FILE__).freeze
VIDEO_THUMBNAILS_DIR = File.expand_path(REPO_DIR + '/dashboard/public/c/video_thumbnails', __FILE__).freeze
FOORM_DIR = File.expand_path(REPO_DIR + '/dashboard/config/foorm', __FILE__).freeze
WHITELISTED_FILES = %w(
  dashboard/config/locales/dsls.en.yml
  dashboard/config/locales/scripts.en.yml
  dashboard/config/locales/courses.en.yml
  dashboard/config/locales/unplugged.en.yml
  dashboard/config/locales/data.en.yml
  dashboard/config/videos.csv
).map {|f| File.join(REPO_DIR, f)}.freeze
ERROR_MESSAGE = "Levelbuilder branch should only commit files in levels directory and specific whitelisted files. See #{__FILE__} for details.".freeze

Dir.chdir REPO_DIR
branchname = `git rev-parse --abbrev-ref HEAD`.strip

exit(0) unless branchname == 'levelbuilder'
staged_files = HooksUtils.get_staged_files

staged_files.each do |filename|
  raise "#{ERROR_MESSAGE}\nFile blocked: #{filename}" unless filename.start_with?(
    BLOCKS_DIR, SHARED_FUNCTIONS_DIR, LIBRARIES_DIR, LEVELS_DIR, COURSES_DIR, VIDEO_THUMBNAILS_DIR, FOORM_DIR
  ) || WHITELISTED_FILES.include?(filename)
end
