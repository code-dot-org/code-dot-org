require_relative '../../deployment'
require 'cdo/rake_utils'
require 'cdo/circle_utils'
require 'cdo/git_utils'
require 'open-uri'
require 'json'

# CircleCI Build Tags
# We provide some limited control over CircleCI's build behavior by adding these
# tags to the latest commit message.  A tag is a set of words in [] square
# brackets - those words can be in any order and are case-insensitive.
#
# Supported Tags:

# Don't run Circle at all (built-in to CircleCI)
# 'ci skip'

# Run all unit/integration tests, not just a subset based on changed files.
RUN_ALL_TESTS_TAG = 'test all'.freeze

# Don't run any UI or Eyes tests.
SKIP_UI_TESTS_TAG = 'skip ui'.freeze

# Don't run UI tests against Chrome
SKIP_CHROME_TAG = 'skip chrome'.freeze

# Run UI tests against Firefox45Win7
TEST_FIREFOX_TAG = 'test firefox'.freeze

# Run UI tests against IE11Win10
TEST_IE_TAG = 'test ie'.freeze
TEST_IE_VERBOSE_TAG = 'test internet explorer'.freeze

# Run UI tests against SafariYosemite
TEST_SAFARI_TAG = 'test safari'.freeze

# Overrides for whether to run Applitools eyes tests
TEST_EYES = 'test eyes'.freeze
SKIP_EYES = 'skip eyes'.freeze

namespace :circle do
  desc 'Runs tests for changed sub-folders, or all tests if the tag specified is present in the most recent commit message.'
  task :run_tests do
    if CircleUtils.tagged?(RUN_ALL_TESTS_TAG)
      HipChat.log "Commit message: '#{CircleUtils.circle_commit_message}' contains [#{RUN_ALL_TESTS_TAG}], force-running all tests."
      RakeUtils.rake_stream_output 'test:all'
    else
      RakeUtils.rake_stream_output 'test:changed'
    end
  end

  desc 'Runs UI tests only if the tag specified is present in the most recent commit message.'
  task :run_ui_tests do
    if CircleUtils.tagged?(SKIP_UI_TESTS_TAG)
      HipChat.log "Commit message: '#{CircleUtils.circle_commit_message}' contains [#{SKIP_UI_TESTS_TAG}], skipping UI tests for this run."
      next
    end
    RakeUtils.exec_in_background 'RACK_ENV=test RAILS_ENV=test bundle exec ./bin/dashboard-server'
    start_sauce_connect
    RakeUtils.system_stream_output 'until $(curl --output /dev/null --silent --head --fail http://localhost.studio.code.org:3000); do sleep 5; done'
    Dir.chdir('dashboard/test/ui') do
      container_features = `find ./features -name '*.feature' | sort | awk "NR % (${CIRCLE_NODE_TOTAL} - 1) == (${CIRCLE_NODE_INDEX} - 1)"`.split("\n").map{|f| f[2..-1]}
      eyes_features = `grep -lr '@eyes' features`.split("\n")
      container_eyes_features = container_features & eyes_features
      ui_test_browsers = browsers_to_run
      unless ui_test_browsers.empty?
        RakeUtils.system_stream_output "bundle exec ./runner.rb" \
            " --feature #{container_features.join(',')}" \
            " --config #{ui_test_browsers.join(',')}" \
            " --pegasus localhost.code.org:3000" \
            " --dashboard localhost.studio.code.org:3000" \
            " --circle" \
            " --parallel 16" \
            " --abort_when_failures_exceed 10" \
            " --retry_count 2" \
            " --html"
      end
      if test_eyes?
        RakeUtils.system_stream_output "bundle exec ./runner.rb" \
            " --eyes" \
            " --feature #{container_eyes_features.join(',')}" \
            " --config ChromeLatestWin7,iPhone" \
            " --pegasus localhost.code.org:3000" \
            " --dashboard localhost.studio.code.org:3000" \
            " --circle" \
            " --parallel 10" \
            " --retry_count 1" \
            " --html"
      end
    end
    close_sauce_connect
    RakeUtils.system_stream_output 'sleep 10'
  end
end

def pipeline_branch?
  ['staging', 'test', 'production'].include?(GitUtils.current_branch)
end

# @return [Array<String>] names of browser configurations for this test run
def browsers_to_run
  browsers = []
  browsers << 'ChromeLatestWin7' unless CircleUtils.tagged?(TEST_CHROME_TAG)
  browsers << 'Firefox45Win7' if CircleUtils.tagged?(TEST_FIREFOX_TAG)
  browsers << 'IE11Win10' if CircleUtils.tagged?(TEST_IE_TAG) || CircleUtils.tagged?(TEST_IE_VERBOSE_TAG)
  browsers << 'SafariYosemite' if CircleUtils.tagged?(TEST_SAFARI_TAG)
end

def test_eyes?
  !CircleUtils.tagged?(SKIP_EYES) &&
      (pipeline_branch? || CircleUtils.tagged?(TEST_EYES))
end

def start_sauce_connect
  RakeUtils.system_stream_output 'wget https://saucelabs.com/downloads/sc-4.4.0-rc2-linux.tar.gz'
  RakeUtils.system_stream_output 'tar -xzf sc-4.4.0-rc2-linux.tar.gz'
  Dir.chdir(Dir.glob('sc-*-linux')[0]) do
    # Run sauce connect a second time on failure, known periodic "Error bringing up tunnel VM." disconnection-after-connect issue, e.g. https://circleci.com/gh/code-dot-org/code-dot-org/20930
    RakeUtils.exec_in_background "for i in 1 2; do ./bin/sc -vv -l $CIRCLE_ARTIFACTS/sc.log -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY -i #{CDO.circle_run_identifier} --tunnel-domains localhost-studio.code.org,localhost.code.org && break; done"
  end
end

def close_sauce_connect
  RakeUtils.system_stream_output 'killall sc'
end
