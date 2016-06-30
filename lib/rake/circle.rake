require 'cdo/rake_utils'
require 'cdo/git_utils'

RUN_UI_TESTS_TAG = '[test ui]'
RUN_ALL_TESTS_TAG = '[test all]'

namespace :circle do
  desc 'Runs tests for changed sub-folders, or all tests if the tag specified is present in the most recent commit message.'
  task :run_tests do
    if GitUtils.circle_commit_contains?(RUN_ALL_TESTS_TAG)
      HipChat.log "Commit message: '#{GitUtils.circle_commit_message}' contains #{RUN_ALL_TESTS_TAG}, force-running all tests."
      RakeUtils.rake_stream_output 'test:all'
    else
      RakeUtils.rake_stream_output 'test:changed'
    end
  end

  desc 'Runs UI tests only if the tag specified is present in the most recent commit message.'
  task :run_ui_tests do
    if GitUtils.circle_commit_contains?(RUN_UI_TESTS_TAG)
      HipChat.log "Commit message: '#{GitUtils.circle_commit_message}' contains #{RUN_UI_TESTS_TAG}, running UI tests."
      # Re-seed levels (some scripts become unavailable after unit tests run?)
      Dir.chdir('dashboard') do
        RakeUtils.rake_stream_output 'seed:all'
      end
      RakeUtils.exec_in_background 'RACK_ENV=test RAILS_ENV=test ./bin/dashboard-server'
      RakeUtils.system_stream_output 'wget https://saucelabs.com/downloads/sc-4.3.15-linux.tar.gz'
      RakeUtils.system_stream_output 'tar -xzf sc-4.3.15-linux.tar.gz'
      Dir.chdir(Dir.glob('sc-*-linux')[0]) do
        RakeUtils.exec_in_background './bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY'
      end
      RakeUtils.system_stream_output 'until $(curl --output /dev/null --silent --head --fail http://localhost.studio.code.org:3000); do sleep 5; done'
      Dir.chdir('dashboard/test/ui') do
        RakeUtils.system_stream_output 'bundle exec ./runner.rb -c ChromeLatestWin7 -p localhost.code.org:3000 -d localhost.studio.code.org:3000 --circle --parallel 20 --retry_count 3 --html'
      end
    else
      HipChat.log "Commit message: '#{GitUtils.circle_commit_message}' does not contain #{RUN_UI_TESTS_TAG}, skipping UI tests."
    end
  end
end
