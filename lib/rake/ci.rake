require_relative '../../deployment'
require 'cdo/chat_client'
require 'cdo/rake_utils'
require 'cdo/ci_utils'
require 'cdo/git_utils'
require 'cdo/sauce_connect'
require 'open-uri'
require 'json'
require 'net/http'
require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

# CI Build Tags
# We provide some limited control over CI's build behavior by adding these
# tags to the latest commit message.  A tag is a set of words in [] square
# brackets - those words can be in any order and are case-insensitive.
#
# Supported Tags:

# Run all unit/integration tests, not just a subset based on changed files.
RUN_ALL_TESTS_TAG = 'test all'.freeze

# Only run apps tests on container 0
RUN_APPS_TESTS_TAG = 'test apps'.freeze

# Don't run any apps tests
SKIP_APPS_TESTS_FLAG = 'skip apps'.freeze

# Don't run any UI or Eyes tests.
SKIP_UI_TESTS_TAG = 'skip ui'.freeze

# Don't run any unit tests.
SKIP_UNIT_TESTS_TAG = 'skip unit'.freeze

# Don't run UI tests against Chrome
SKIP_CHROME_TAG = 'skip chrome'.freeze

# Run UI tests against Firefox
TEST_FIREFOX_TAG = 'test firefox'.freeze

# Run UI tests against Safari
TEST_SAFARI_TAG = 'test safari'.freeze

# Run UI tests against iPad, iPhone or both
TEST_IPAD_TAG = 'test ipad'.freeze
TEST_IPHONE_TAG = 'test iphone'.freeze
TEST_IOS_TAG = 'test ios'.freeze

# Run UI tests against all browsers
TEST_ALL_BROWSERS_TAG = 'test all browsers'.freeze

# Overrides for whether to run Applitools eyes tests
TEST_EYES = 'test eyes'.freeze
SKIP_EYES = 'skip eyes'.freeze

namespace :ci do
  desc 'Runs tests for changed sub-folders, or all tests if the tag specified is present in the most recent commit message.'
  timed_task_with_logging :run_tests do
    unless CI::Utils.ci_job_unit_tests?
      ChatClient.log "Wrong CI job, skipping"
      next
    end

    if CI::Utils.tagged?(RUN_ALL_TESTS_TAG)
      ChatClient.log "Commit message: '#{CI::Utils.git_commit_message}' contains [#{RUN_ALL_TESTS_TAG}], force-running all tests."
      RakeUtils.rake_stream_output 'test:all'
    elsif CI::Utils.tagged?(RUN_APPS_TESTS_TAG)
      ChatClient.log "Commit message: '#{CI::Utils.git_commit_message}' contains [#{RUN_APPS_TESTS_TAG}], force-running apps tests."
      RakeUtils.rake_stream_output 'test:apps'
      RakeUtils.rake_stream_output 'test:changed:all_but_apps'
    elsif CI::Utils.tagged?(SKIP_APPS_TESTS_FLAG)
      ChatClient.log "Commit message: '#{CI::Utils.git_commit_message}' contains [#{SKIP_APPS_TESTS_FLAG}], skipping apps tests."
      RakeUtils.rake_stream_output 'test:changed:all_but_apps'
    elsif CI::Utils.tagged?(SKIP_UNIT_TESTS_TAG)
      ChatClient.log "Commit message: '#{CI::Utils.git_commit_message}' contains [#{SKIP_UNIT_TESTS_TAG}], skipping unit tests."
    else
      RakeUtils.rake_stream_output 'test:changed'
    end

    check_for_new_file_changes
  end

  desc 'Runs UI tests only if the tag specified is present in the most recent commit message.'
  timed_task_with_logging :run_ui_tests do
    unless CI::Utils.ci_job_ui_tests?
      ChatClient.log "Wrong CI job, skipping"
      next
    end

    if CI::Utils.tagged?(SKIP_UI_TESTS_TAG)
      ChatClient.log "Commit message: '#{CI::Utils.git_commit_message}' contains [#{SKIP_UI_TESTS_TAG}], skipping UI tests for this run."
      next
    end

    # Make sure the destination for our JUnit XML test reports exists
    RakeUtils.system_stream_output 'mkdir -p $CI_TEST_REPORTS/cucumber'

    Dir.chdir('dashboard') do
      RakeUtils.exec_in_background 'RAILS_ENV=test bundle exec puma -e test'
    end
    ui_test_browsers = browsers_to_run
    use_saucelabs = !ui_test_browsers.empty?
    if use_saucelabs || test_eyes?
      Cdo::SauceConnect.start_sauce_connect(daemonize: true)
    end
    RakeUtils.wait_for_url('http://localhost-studio.code.org:3000')
    Dir.chdir('dashboard/test/ui') do
      container_features = `find ./features -name '*.feature' | sort`.split("\n").map {|f| f[2..]}
      eyes_features = `grep -lr '@eyes' features`.split("\n")
      container_eyes_features = container_features & eyes_features
      # Use --local to configure the UI tests to run against localhost and
      # use --config to override the local webdriver so SauceLabs is used
      # instead.
      RakeUtils.system_stream_output "bundle exec ./runner.rb " \
          "--feature #{container_features.join(',')} " \
          "--local " \
          "--ci " \
          "#{use_saucelabs ? "--config #{ui_test_browsers.join(',')} " : ''}" \
          "--parallel #{use_saucelabs ? 16 : 8} " \
          "--abort_when_failures_exceed 10 " \
          "--retry_count 2 " \
          "--output-synopsis " \
          "--with-status-page " \
          "--html"
      if test_eyes?
        RakeUtils.system_stream_output "bundle exec ./runner.rb " \
            "--eyes " \
            "--feature #{container_eyes_features.join(',')} " \
            "--config Chrome,iPhone " \
            "--local " \
            "--ci " \
            "--parallel 10 " \
            "--retry_count 1 " \
            "--with-status-page " \
            "--html"
      end
    end
    close_sauce_connect if use_saucelabs || test_eyes?
    RakeUtils.system_stream_output 'sleep 10'

    check_for_new_file_changes
  end

  desc 'Checks for unexpected changes (for example, after a build step) and raises an exception if an unexpected change is found'
  timed_task_with_logging :check_for_unexpected_apps_changes do
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

  timed_task_with_logging :seed_ui_test do
    unless CI::Utils.ci_job_ui_tests?
      ChatClient.log "Wrong CI job, skipping"
      next
    end

    if CI::Utils.tagged?(SKIP_UI_TESTS_TAG)
      ChatClient.log "Commit message: '#{CI::Utils.git_commit_message}' contains [#{SKIP_UI_TESTS_TAG}], skipping UI tests for this run."
      next
    end

    Dir.chdir('dashboard') do
      RakeUtils.rake_stream_output 'seed:cached_ui_test'
    end
  end
end

# @return [Array<String>] names of browser configurations for this test run
def browsers_to_run
  browsers = []
  browsers << 'Chrome' unless CI::Utils.tagged?(SKIP_CHROME_TAG)
  browsers << 'Firefox' if CI::Utils.tagged?(TEST_FIREFOX_TAG) || CI::Utils.tagged?(TEST_ALL_BROWSERS_TAG)
  browsers << 'Safari' if CI::Utils.tagged?(TEST_SAFARI_TAG) || CI::Utils.tagged?(TEST_ALL_BROWSERS_TAG)
  browsers << 'iPad' if CI::Utils.tagged?(TEST_IPAD_TAG) || CI::Utils.tagged?(TEST_IOS_TAG) || CI::Utils.tagged?(TEST_ALL_BROWSERS_TAG)
  browsers << 'iPhone' if CI::Utils.tagged?(TEST_IPHONE_TAG) || CI::Utils.tagged?(TEST_IOS_TAG) || CI::Utils.tagged?(TEST_ALL_BROWSERS_TAG)
  browsers
end

def test_eyes?
  !CI::Utils.tagged?(SKIP_EYES)
end

def close_sauce_connect
  RakeUtils.system_stream_output 'killall sc'
end

def check_for_new_file_changes
  if GitUtils.changed_in_branch_or_local?(GitUtils.current_branch, ['dashboard/config/locales/*/en.yml'])
    RakeUtils.system_stream_output('git diff -- dashboard/config/locales | cat')
    raise 'Unexpected change to dashboard/config/locales/ - Make sure you run seeding locally and include those changes in your branch.'
  end
  if GitUtils.changed_in_branch_or_local?(GitUtils.current_branch, ['dashboard/db/schema.rb'])
    RakeUtils.system_stream_output('git diff -- dashboard/db/schema.rb | cat')
    raise 'Unexpected change to schema.rb - Make sure you run your migration locally and push those changes into your branch.'
  end
end
