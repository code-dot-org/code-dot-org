require 'cdo/rake_utils'
require 'cdo/git_utils'
require 'open-uri'
require 'json'

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
    RakeUtils.exec_in_background 'RACK_ENV=test RAILS_ENV=test bundle exec ./bin/dashboard-server'
    RakeUtils.system_stream_output 'wget https://saucelabs.com/downloads/sc-4.4.0-rc1-linux.tar.gz'
    RakeUtils.system_stream_output 'tar -xzf sc-4.4.0-rc1-linux.tar.gz'
    Dir.chdir(Dir.glob('sc-*-linux')[0]) do
      # Run sauce connect a second time on failure, known periodic "Error bringing up tunnel VM." disconnection-after-connect issue, e.g. https://circleci.com/gh/code-dot-org/code-dot-org/20930
      RakeUtils.exec_in_background 'for i in 1 2; do ./bin/sc -vv -l $CIRCLE_ARTIFACTS/sc.log -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY -i CIRCLE-BUILD-$CIRCLE_BUILD_NUM-$CIRCLE_NODE_INDEX --tunnel-domains localhost-studio.code.org,localhost.code.org && break; done'
    end
    RakeUtils.system_stream_output 'until $(curl --output /dev/null --silent --head --fail http://localhost.studio.code.org:3000); do sleep 5; done'
    Dir.chdir('dashboard/test/ui') do
      container_features = `find ./features -name '*.feature' | sort | awk "NR % (${CIRCLE_NODE_TOTAL} - 1) == (${CIRCLE_NODE_INDEX} - 1)"`.split("\n").map{|f| f[2..-1]}
      eyes_features = `grep -lr '@eyes' features`.split("\n")
      container_eyes_features = container_features & eyes_features
      RakeUtils.system_stream_output "bundle exec ./runner.rb -f #{container_features.join(',')} -c ChromeLatestWin7,Firefox45Win7,IE11Win10,SafariYosemite -p localhost.code.org:3000 -d localhost.studio.code.org:3000 --circle --parallel 26 --retry_count 3 --html"
      if ['staging', 'test', 'production'].include?(GitUtils.current_branch)
        RakeUtils.system_stream_output "bundle exec ./runner.rb --eyes -f #{container_eyes_features.join(',')} -c ChromeLatestWin7,iPhone -p localhost.code.org:3000 -d localhost.studio.code.org:3000 --circle --parallel 26 --retry_count 3 --html"
        RakeUtils.system_stream_output "bundle exec ./runner.rb --eyes -f #{eyes_features.join(',')} -c ChromeLatestWin7,iPhone -p localhost.code.org:3000 -d localhost.studio.code.org:3000 --circle --parallel 26 --retry_count 3 --html"
      end
    end
  end
end
