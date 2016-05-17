require 'cdo/rake_utils'
require 'cdo/git_utils'

namespace :circle do
  desc 'Runs tests for changed sub-folders, or all tests if the tag specified is present in the most recent commit message.'
  task :run_tests, [:force_all_tests_tag] do |_, args|
    run_all_tests_tag = args[:force_all_tests_tag]
    if GitUtils.circle_commit_contains?(run_all_tests_tag)
      HipChat.log "Commit message: '#{GitUtils.circle_commit_message}' contains #{run_all_tests_tag}, force-running all tests."
      RakeUtils.rake_stream_output 'test:all'
    else
      RakeUtils.rake_stream_output 'test:changed'
    end
  end

  desc 'Runs UI tests only if the tag specified is present in the most recent commit message.'
  task :run_ui_tests, [:force_tests_commit_tag] do |_, args|
    run_ui_tests_tag = args[:force_tests_commit_tag]
    if GitUtils.circle_commit_contains?(run_ui_tests_tag)
      HipChat.log "Commit message: '#{GitUtils.circle_commit_message}' contains #{run_ui_tests_tag}, running UI tests."
      RakeUtils.exec_in_background 'RACK_ENV=test RAILS_ENV=test ./bin/dashboard-server'
      RakeUtils.system_stream_output 'wget https://saucelabs.com/downloads/sc-latest-linux.tar.gz'
      RakeUtils.system_stream_output 'tar -xzf sc-latest-linux.tar.gz'
      Dir.chdir(Dir.glob('sc-*-linux')[0]) do
        RakeUtils.exec_in_background './bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY'
      end
      RakeUtils.system_stream_output 'until $(curl --output /dev/null --silent --head --fail http://localhost.studio.code.org:3000); do sleep 5; done'
      Dir.chdir('dashboard/test/ui') do
        RakeUtils.system_stream_output 'bundle exec ./runner.rb -c ChromeLatestWin7 -p localhost.code.org:3000 -d localhost.studio.code.org:3000 --circle --parallel 50 --retry_count 3 --html'
      end
    else
      HipChat.log "Commit message: '#{GitUtils.circle_commit_message}' does not contain #{run_ui_tests_tag}, skipping UI tests."
    end
  end
end
