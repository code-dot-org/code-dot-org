require_relative '../../deployment'
require 'cdo/chat_client'

if rack_env?(:development) || rack_env?(:test)
  require 'cdo/rake_utils'
  require 'cdo/eyes_utils'
  require 'cdo/git_utils'
  require 'gemoji'
end

MERGE_EMOJI = "\u{1F500}".freeze

def create_branch(branch)
  require 'eyes_selenium'
  require_relative '../../dashboard/test/ui/utils/selenium_browser'
  EyesUtils.check_eyes_set
  eyes = Applitools::Selenium::Eyes.new
  eyes.api_key = CDO.applitools_eyes_api_key
  eyes.branch_name = branch
  driver = SeleniumBrowser.local_browser
  eyes.open(app_name: 'Code.org', test_name: "Creating branch #{branch} dummy empty check.", driver: driver)
  eyes.check_window('Dummy branch creation check', 5)
  eyes.close(false)
  driver.quit
end

namespace :eyes do
  task :merge, [:branch, :base] do |_, args|
    EyesUtils.check_eyes_set
    ChatClient.log "#{MERGE_EMOJI}  Merging baselines #{args}"
    EyesUtils.merge_eyes_baselines(args[:branch], args[:base])
  end
  task :force_merge, [:branch, :base] do |_, args|
    EyesUtils.check_eyes_set
    ChatClient.log "#{Emoji.find_by_alias('muscle').raw}  Force merging baselines #{args}"
    EyesUtils.force_merge_eyes_baselines(args[:branch], args[:base])
  end
  task :copy, [:branch, :base] do |_, args|
    EyesUtils.check_eyes_set
    ChatClient.log "#{Emoji.find_by_alias('clipboard').raw}  Copying baselines #{args}"
    EyesUtils.copy_eyes_baselines(args[:branch], args[:base])
  end
  task :force_copy, [:branch, :base] do |_, args|
    EyesUtils.check_eyes_set
    ChatClient.log "#{Emoji.find_by_alias('muscle').raw}#{Emoji.find_by_alias('clipboard').raw}  Force copying baselines #{args}"
    EyesUtils.force_copy_eyes_baselines(args[:branch], args[:base])
  end
  task :create, [:branch] do |_, args|
    EyesUtils.check_eyes_set
    ChatClient.log "#{Emoji.find_by_alias('baby').raw}  Creating branch #{args}"
    create_branch(args[:branch])
  end
  task :delete, [:branch] do |_, args|
    EyesUtils.check_eyes_set
    ChatClient.log "Deleting branch #{args}"
    EyesUtils.delete_eyes_branch(args[:branch])
  end
  task :merge_delete, [:branch, :base] do |_, args|
    EyesUtils.check_eyes_set
    ChatClient.log "Deleting branch #{args}"
    EyesUtils.merge_delete_eyes_branch(args[:branch], args[:base])
  end
end
