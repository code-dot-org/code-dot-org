require_relative '../../deployment'

if rack_env?(:development) || rack_env?(:test)
  require 'cdo/rake_utils'
  require 'cdo/git_utils'
  require 'open-uri'
  require 'json'
  require 'fileutils'
  require 'eyes_selenium'
  require_relative '../../dashboard/test/ui/utils/selenium_browser'
end

EYES_ACCESS_KEY_ENV_NAME = 'EYES_ACCESS_KEY'
TMP_UTIL_DIR = '.tmputils'

MERGE_UTIL_PATH = "#{TMP_UTIL_DIR}/applitools-merge.jar"
REMOTE_JAR_SOURCE = 'https://s3.amazonaws.com/cdo-circle-utils/applitools-merge.jar'
EYES_API_URL = "https://eyes.applitools.com/api/baselines/copybranch?accesskey=$#{EYES_ACCESS_KEY_ENV_NAME}"
BASE_MERGE_UTIL_CALL = "java -jar #{MERGE_UTIL_PATH} -url #{EYES_API_URL}"
MERGE_EMOJI = "\u{1F500}"

def ensure_merge_util
  java_version_output = `java -version 2>&1`
  raise "Applitools merge util requires Java 1.8 #{Emoji.find_by_alias('sweat_smile').raw}" unless java_version_output =~ /version "1\.8/
  unless File.exist? MERGE_UTIL_PATH
    RakeUtils.system_stream_output "wget #{REMOTE_JAR_SOURCE} -O #{MERGE_UTIL_PATH}"
  end
end

def merge_eyes_baselines(branch, base)
  ensure_merge_util
  RakeUtils.system_stream_output "#{BASE_MERGE_UTIL_CALL} -n Code.org -s #{branch} -t #{base}"
end

def force_merge_eyes_baselines(branch, base)
  ensure_merge_util
  RakeUtils.system_stream_output "#{BASE_MERGE_UTIL_CALL} -n Code.org -o true -s #{branch} -t #{base}"
end

def copy_eyes_baselines(branch, base)
  ensure_merge_util
  RakeUtils.system_stream_output "#{BASE_MERGE_UTIL_CALL} -n Code.org -c true -s #{branch} -t #{base}"
end

def force_copy_eyes_baselines(branch, base)
  ensure_merge_util
  RakeUtils.system_stream_output "#{BASE_MERGE_UTIL_CALL} -n Code.org -o true -c true -s #{branch} -t #{base}"
end

def delete_eyes_branch(branch)
  ensure_merge_util
  RakeUtils.system_stream_output "#{BASE_MERGE_UTIL_CALL} -n Code.org -s #{branch} -t #{branch} -d true"
end

def merge_delete_eyes_branch(branch, base)
  ensure_merge_util
  RakeUtils.system_stream_output "#{BASE_MERGE_UTIL_CALL} -n Code.org -s #{branch} -t #{base} -d true"
end

def create_branch(branch)
  eyes = Applitools::Eyes.new
  eyes.api_key = CDO.applitools_eyes_api_key
  eyes.branch_name = branch
  driver = SeleniumBrowser.local_browser
  eyes.open(app_name: 'Code.org', test_name: "Creating branch #{branch} dummy empty check.", driver: driver)
  eyes.check_window('Dummy branch creation check', 5)
  eyes.close(false)
  driver.quit
end

def check_eyes_set
  raise "Must export env var $#{EYES_ACCESS_KEY_ENV_NAME} to run eyes commands." unless ENV[EYES_ACCESS_KEY_ENV_NAME]
end

namespace :eyes do
  task :merge, [:branch, :base] do |t, args|
    check_eyes_set
    HipChat.log "#{MERGE_EMOJI}  Merging baselines #{args}"
    merge_eyes_baselines(args[:branch], args[:base])
  end
  task :force_merge, [:branch, :base] do |_, args|
    check_eyes_set
    HipChat.log "  Force merging baselines #{args}"
    force_merge_eyes_baselines(args[:branch], args[:base])
  end
  task :copy, [:branch, :base] do |_, args|
    check_eyes_set
    HipChat.log "  Copying baselines #{args}"
    copy_eyes_baselines(args[:branch], args[:base])
  end
  task :force_copy, [:branch, :base] do |_, args|
    check_eyes_set
    HipChat.log "  Force copying baselines #{args}"
    force_copy_eyes_baselines(args[:branch], args[:base])
  end
  task :create, [:branch] do |_, args|
    check_eyes_set
    HipChat.log "  Creating branch #{args}"
    create_branch(args[:branch])
  end
  task :delete, [:branch] do |_, args|
    check_eyes_set
    HipChat.log "Deleting branch #{args}"
    delete_eyes_branch(args[:branch])
  end
  task :merge_delete, [:branch, :base] do |_, args|
    check_eyes_set
    HipChat.log "Deleting branch #{args}"
    merge_delete_eyes_branch(args[:branch], args[:base])
  end
end
