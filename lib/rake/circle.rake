require_relative '../../deployment'
require 'cdo/chat_client'
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

# Only run apps tests on container 0
RUN_APPS_TESTS_TAG = 'test apps'.freeze

# Don't run any UI or Eyes tests.
SKIP_UI_TESTS_TAG = 'skip ui'.freeze

# Don't run any unit tests.
SKIP_UNIT_TESTS_TAG = 'skip unit'.freeze

# Run UI tests against ChromeLatestWin7
SKIP_CHROME_TAG = 'skip chrome'.freeze

# Run UI tests against Chrome44Win7
TEST_CHROME_44_TAG = 'test chrome 44'.freeze

# Run UI tests against Firefox45Win7
TEST_FIREFOX_TAG = 'test firefox'.freeze

# Run UI tests against IE11Win10
TEST_IE_TAG = 'test ie'.freeze
TEST_IE_VERBOSE_TAG = 'test internet explorer'.freeze

# Run UI tests against SafariYosemite
TEST_SAFARI_TAG = 'test safari'.freeze

# Run UI tests against iPad, iPhone or both
TEST_IPAD_TAG = 'test ipad'.freeze
TEST_IPHONE_TAG = 'test iphone'.freeze
TEST_IOS_TAG = 'test ios'.freeze

# Overrides for whether to run Applitools eyes tests
TEST_EYES = 'test eyes'.freeze
SKIP_EYES = 'skip eyes'.freeze

namespace :circle do
  desc 'Runs tests for changed sub-folders, or all tests if the tag specified is present in the most recent commit message.'
  task :run_tests do
    unless CircleUtils.unit_test_container?
      ChatClient.log "Wrong container, skipping"
      next
    end

    if CircleUtils.tagged?(RUN_ALL_TESTS_TAG)
      ChatClient.log "Commit message: '#{CircleUtils.circle_commit_message}' contains [#{RUN_ALL_TESTS_TAG}], force-running all tests."
      RakeUtils.rake_stream_output 'test:all'
    elsif CircleUtils.tagged?(RUN_APPS_TESTS_TAG)
      ChatClient.log "Commit message: '#{CircleUtils.circle_commit_message}' contains [#{RUN_APPS_TESTS_TAG}], force-running apps tests."
      RakeUtils.rake_stream_output 'test:apps'
      RakeUtils.rake_stream_output 'test:changed:all_but_apps'
    elsif CircleUtils.tagged?(SKIP_UNIT_TESTS_TAG)
      ChatClient.log "Commit message: '#{CircleUtils.circle_commit_message}' contains [#{SKIP_UNIT_TESTS_TAG}], skipping unit tests."
    else
      RakeUtils.rake_stream_output 'test:changed'
    end
  end

  desc 'Runs UI tests only if the tag specified is present in the most recent commit message.'
  task run_ui_tests: [:recompile_assets] do
    unless CircleUtils.ui_test_container?
      ChatClient.log "Wrong container, skipping"
      next
    end

    if CircleUtils.tagged?(SKIP_UI_TESTS_TAG)
      ChatClient.log "Commit message: '#{CircleUtils.circle_commit_message}' contains [#{SKIP_UI_TESTS_TAG}], skipping UI tests for this run."
      next
    end

    # Make sure the destination for our JUnit XML test reports exists
    RakeUtils.system_stream_output 'mkdir -p $CIRCLE_TEST_REPORTS/cucumber'

    Dir.chdir('dashboard') do
      RakeUtils.exec_in_background 'RAILS_ENV=test bundle exec puma -e test'
    end
    ui_test_browsers = browsers_to_run
    use_saucelabs = !ui_test_browsers.empty?
    if use_saucelabs || test_eyes?
      start_sauce_connect
      RakeUtils.system_stream_output 'until $(curl --output /dev/null --silent --head --fail http://localhost:4445); do sleep 5; done'
    end
    RakeUtils.system_stream_output 'until $(curl --output /dev/null --silent --head --fail http://localhost-studio.code.org:3000); do sleep 5; done'
    Dir.chdir('dashboard/test/ui') do
      container_features = `find ./features -name '*.feature' | sort`.split("\n").map {|f| f[2..-1]}
      eyes_features = `grep -lr '@eyes' features`.split("\n")
      container_eyes_features = container_features & eyes_features
      RakeUtils.system_stream_output "bundle exec ./runner.rb" \
          " --feature #{container_features.join(',')}" \
          " --pegasus localhost.code.org:3000" \
          " --dashboard localhost-studio.code.org:3000" \
          " --circle" \
          " --#{use_saucelabs ? "config #{ui_test_browsers.join(',')}" : 'local'}" \
          " --parallel #{use_saucelabs ? 16 : 8}" \
          " --abort_when_failures_exceed 10" \
          " --retry_count 2" \
          " --output-synopsis" \
          " --html"
      if test_eyes?
        RakeUtils.system_stream_output "bundle exec ./runner.rb" \
            " --eyes" \
            " --feature #{container_eyes_features.join(',')}" \
            " --config ChromeLatestWin7,iPhone" \
            " --pegasus localhost.code.org:3000" \
            " --dashboard localhost-studio.code.org:3000" \
            " --circle" \
            " --parallel 10" \
            " --retry_count 1" \
            " --html"
      end
    end
    close_sauce_connect if use_saucelabs || test_eyes?
    RakeUtils.system_stream_output 'sleep 10'
  end

  desc 'Checks for unexpected changes (for example, after a build step) and raises an exception if an unexpected change is found'
  task :check_for_unexpected_apps_changes do
    # Changes to yarn.lock is a particularly common case; catch it early and
    # provide a helpful error message.
    if RakeUtils.git_staged_changes? apps_dir 'yarn.lock'
      Dir.chdir(apps_dir) do
        RakeUtils.system_stream_output('git diff yarn.lock | cat')
      end
      raise 'Unexpected change to apps/yarn.lock; if you changed package.json you should also have committed an updated yarn.lock file.'
    end

    # More generally, we shouldn't have _any_ staged changes in the apps directory.
    if RakeUtils.git_staged_changes? apps_dir
      RakeUtils.system_stream_output("git status --porcelain #{apps_dir}")
      raise "Unexpected staged changes in apps directory."
    end
  end

  task :seed_ui_test do
    unless CircleUtils.ui_test_container?
      ChatClient.log "Wrong container, skipping"
      next
    end

    if CircleUtils.tagged?(SKIP_UI_TESTS_TAG)
      ChatClient.log "Commit message: '#{CircleUtils.circle_commit_message}' contains [#{SKIP_UI_TESTS_TAG}], skipping UI tests for this run."
      next
    end

    Dir.chdir('dashboard') do
      RakeUtils.rake_stream_output 'seed:cached_ui_test'
    end
  end

  desc 'Rebuild dashboard assets with updated locals.yml settings before running UI tests'
  task :recompile_assets do
    if CircleUtils.tagged?(SKIP_UI_TESTS_TAG)
      ChatClient.log "Commit message: '#{CircleUtils.circle_commit_message}' contains [#{SKIP_UI_TESTS_TAG}], skipping UI tests for this run."
      next
    end

    system 'rm', '-rf', dashboard_dir('tmp', 'cache', 'assets')
    Dir.chdir(dashboard_dir) do
      RakeUtils.rake 'assets:precompile'
    end
  end
end

# @return [Array<String>] names of browser configurations for this test run
def browsers_to_run
  browsers = []
  browsers << 'ChromeLatestWin7' unless CircleUtils.tagged?(SKIP_CHROME_TAG)
  browsers << 'Chrome44Win7' if CircleUtils.tagged?(TEST_CHROME_44_TAG)
  browsers << 'Firefox45Win7' if CircleUtils.tagged?(TEST_FIREFOX_TAG)
  browsers << 'IE11Win10' if CircleUtils.tagged?(TEST_IE_TAG) || CircleUtils.tagged?(TEST_IE_VERBOSE_TAG)
  browsers << 'SafariYosemite' if CircleUtils.tagged?(TEST_SAFARI_TAG)
  browsers << 'iPad' if CircleUtils.tagged?(TEST_IPAD_TAG) || CircleUtils.tagged?(TEST_IOS_TAG)
  browsers << 'iPhone' if CircleUtils.tagged?(TEST_IPHONE_TAG) || CircleUtils.tagged?(TEST_IOS_TAG)
  browsers
end

def test_eyes?
  !CircleUtils.tagged?(SKIP_EYES)
end

def start_sauce_connect
  RakeUtils.system_stream_output 'wget https://s3.amazonaws.com/cdo-circle-utils/sc-build-3265-linux.tar.gz'
  RakeUtils.system_stream_output 'tar -xzf sc-build-3265-linux.tar.gz'
  Dir.chdir(Dir.glob('sc-build-3265')[0]) do
    # Run sauce connect a second time on failure, known periodic "Error bringing up tunnel VM." disconnection-after-connect issue, e.g. https://circleci.com/gh/code-dot-org/code-dot-org/20930
    RakeUtils.exec_in_background "for i in 1 2; do ./bin/sc -vv -l $CIRCLE_ARTIFACTS/sc.log -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY -i #{CDO.circle_run_identifier} --tunnel-domains *.code.org,*.csedweek.org,*.hourofcode.com,*.codeprojects.org --wait-tunnel-shutdown && break; done"
  end
end

def close_sauce_connect
  RakeUtils.system_stream_output 'killall sc'
end
