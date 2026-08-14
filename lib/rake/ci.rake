# frozen_string_literal: true

require_relative '../../deployment'
require 'cdo/chat_client'
require 'cdo/rake_utils'
require 'cdo/ci_utils'
require 'cdo/git_utils'
require 'cdo/sauce_connect'
require 'cdo/aws/device_farm'
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
RUN_ALL_TESTS_TAG = 'test all'

# Only run apps tests on container 0
RUN_APPS_TESTS_TAG = 'test apps'

# Don't run any apps tests
SKIP_APPS_TESTS_FLAG = 'skip apps'

# Don't run any UI or Eyes tests.
SKIP_UI_TESTS_TAG = 'skip ui'

# Reset the dashboard database before seeding for UI tests. It is recommended to
# use this tag when running drone against PRs that reduce what gets seeded in
# drone via seed:ui_test, such as if you remove something from UI_TEST_SCRIPTS.
#
# By default, the database will have been prepopulated based on recent data
# from the staging branch (see cache-staging-build pipeline in .drone.yml).
# If you remove something from UI_TEST_SCRIPTS but do not specify this tag,
# drone will still have that unit seeded in the database, possibly masking any
# test failures that might show up in later drone builds after you merge.
RESET_DB_TAG = 'reset db'

# Don't run any unit tests.
SKIP_UNIT_TESTS_TAG = 'skip unit'

# Don't run UI tests against Chrome
SKIP_CHROME_TAG = 'skip chrome'

# Run UI tests against Firefox
TEST_FIREFOX_TAG = 'test firefox'

# Run UI tests against Safari
TEST_SAFARI_TAG = 'test safari'

# Run UI tests against iPad, iPhone or both
TEST_IPAD_TAG = 'test ipad'
TEST_IPHONE_TAG = 'test iphone'
TEST_IOS_TAG = 'test ios'

# Run UI tests against all browsers
TEST_ALL_BROWSERS_TAG = 'test all browsers'

# Browser tags that force UI tests onto SauceLabs, because Device Farm requires
# Chrome in CI.
#
# The CI codepath for Device Farm relies on Chrome's --host-resolver-rules to
# reach puma at localhost-studio.code.org:3000, which is a chromedriver-specific
# flag we don't have a clean equivalent for in Firefox/Safari.
NON_CHROME_TAGS = [
  TEST_FIREFOX_TAG,
  TEST_SAFARI_TAG,
  TEST_IPAD_TAG,
  TEST_IPHONE_TAG,
  TEST_IOS_TAG,
  TEST_ALL_BROWSERS_TAG,
].freeze

# Overrides for whether to run Applitools eyes tests
TEST_EYES = 'test eyes'
SKIP_EYES = 'skip eyes'

# By default, to conserve our SauceLabs credits we run our UI and Eyes tests
# against a local webdriver first, and only use SauceLabs to rerun any tests
# that fail. This flag ensures all tests will use SauceLabs for all runs.
SKIP_LOCAL_WEBDRIVER = 'skip local webdriver'

# By default, UI test reruns hit AWS Device Farm Chrome. This tag opts
# out and falls back to SauceLabs.
USE_SAUCELABS_TAG = 'use saucelabs'

# Maximum parallel browsers to use for UI and eyes tests
PARALLEL_COUNT = 24

namespace :ci do
  desc 'Runs tests for changed sub-folders, or all tests if the tag specified is present in the most recent commit message.'
  timed_task_with_logging :run_unit_tests do
    target_branch = ENV.fetch('DRONE_TARGET_BRANCH', '')
    if CI::Utils.tagged?(RUN_ALL_TESTS_TAG)
      ChatClient.log "Commit message: '#{CI::Utils.git_commit_message}' contains [#{RUN_ALL_TESTS_TAG}], force-running all tests."
      RakeUtils.rake_stream_output 'test:all'
    # Always run all unit tests on pull requests against the 'test' branch
    elsif target_branch == 'test'
      ChatClient.log "Target branch is #{target_branch.dump}, force-running all tests."
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

    check_for_new_file_changes

    if CI::Utils.tagged?(SKIP_UI_TESTS_TAG)
      ChatClient.log "Commit message: '#{CI::Utils.git_commit_message}' contains [#{SKIP_UI_TESTS_TAG}], skipping UI tests for this run."
      next
    end

    # Make sure the destination for our JUnit XML test reports exists
    RakeUtils.system_stream_output 'mkdir -p $CI_TEST_REPORTS/cucumber'

    Dir.chdir('dashboard') do
      RakeUtils.exec_in_background 'RAILS_ENV=test bundle exec puma -e test'
    end
    non_chrome_tagged = NON_CHROME_TAGS.any? {|t| CI::Utils.tagged?(t)}
    if non_chrome_tagged
      ChatClient.log "Non-Chrome browser tag present; routing UI tests via SauceLabs (Device Farm path only supports Chrome)."
    elsif CI::Utils.tagged?(USE_SAUCELABS_TAG)
      ChatClient.log "Commit message: '#{CI::Utils.git_commit_message}' contains [#{USE_SAUCELABS_TAG}], routing UI tests via SauceLabs."
    end
    use_device_farm = !(non_chrome_tagged || CI::Utils.tagged?(USE_SAUCELABS_TAG))
    ui_test_browsers = use_device_farm ? device_farm_browsers_to_run : saucelabs_browsers_to_run
    # local webdriver only supports Chrome.
    skip_local_webdriver = CI::Utils.tagged?(SKIP_LOCAL_WEBDRIVER) || non_chrome_tagged

    # SauceLabs uses Sauce Connect to tunnel into the drone worker container.
    needs_sauce_connect = !use_device_farm
    if needs_sauce_connect
      Cdo::SauceConnect.start_sauce_connect(dump_logs: true, verbose: true)
    end

    # In order for Device Farm to reach localhost, the Device Farm project (set
    # in CDO.device_farm_desktop_project_id) must live in the same VPC as the
    # drone workers and belong to the DeviceFarmToDroneWorker security group.
    # This works because:
    # - the ui-tests step in .drone.yml runs in `network_mode: host`, making
    #   puma accessible at port 3000 on the drone worker's primary ENI
    # - the DroneRunnerEcsSecurityGroup on the drone worker allows inbound
    #   traffic on port 3000 from the DeviceFarmToDroneWorker security group
    # - Chrome's --host-resolver-rules maps localhost-studio.code.org to drone
    #   worker IP (see connect.rb).
    RakeUtils.wait_for_url('http://localhost-studio.code.org:3000')

    # Runs first, so Cucumber cannot change this result. The ensure block raises
    # the failure later, after Cucumber also runs. One build then shows both.
    ENV['TARGET_URL'] = 'http://localhost-studio.code.org:3000'
    playwright_browsers = playwright_browsers_to_run
    playwright_failure =
      if playwright_browsers.empty?
        # An empty --project list runs every project, including the visual ones.
        ChatClient.log 'Playwright functional tests skipped: no browsers selected.'
        nil
      else
        ENV['PLAYWRIGHT_BROWSERS'] = playwright_browsers.join(' ')
        begin
          Rake::Task['test:playwright_ui'].invoke
          nil
        rescue StandardError => exception
          exception
        end
      end
    Rake::Task['test:playwright_eyes'].invoke

    Dir.chdir('dashboard/test/ui') do
      container_features = `find ./features -name '*.feature' | sort`.split("\n").map {|f| f[2..]}
      eyes_features = `grep -lr '@eyes' features`.split("\n")
      container_eyes_features = container_features & eyes_features
      # Use --local to configure the UI tests to run against localhost, and
      # --config to override the local webdriver with the remote provider
      # (Device Farm Chrome by default, SauceLabs under [use saucelabs] or any
      # non-Chrome browser tag). --first-run-local keeps the first attempt on
      # the in-container chromedriver and only hands off to the remote provider
      # on rerun.
      RakeUtils.system_stream_output "bundle exec ./runner.rb " \
          "--feature #{container_features.join(',')} " \
          "--local " \
          "--ci " \
          "--db " \
          "#{use_device_farm ? '--device-farm ' : ''}" \
          "#{ui_test_browsers.empty? ? '' : "--config #{ui_test_browsers.join(',')} "}" \
          "--parallel #{PARALLEL_COUNT} " \
          "--abort_when_failures_exceed 10 " \
          "--retry_count 2 " \
          "#{skip_local_webdriver ? '' : '--first-run-local '}" \
          "--output-synopsis " \
          "--with-status-page " \
          "--html"
      if test_eyes?
        RakeUtils.system_stream_output "bundle exec ./runner.rb " \
            "--eyes " \
            "--feature #{container_eyes_features.join(',')} " \
            "--local " \
            "--ci " \
            "--db " \
            "#{use_device_farm ? '--device-farm ' : ''}" \
            "--config Chrome " \
            "--parallel #{PARALLEL_COUNT} " \
            "--abort_when_failures_exceed 10 " \
            "--retry_count 2 " \
            "#{skip_local_webdriver ? '' : '--first-run-local '}" \
            "--output-synopsis " \
            "--with-status-page " \
            "--html"
      end
    end
    close_sauce_connect if needs_sauce_connect
    RakeUtils.system_stream_output 'sleep 10'
  ensure
    # Cucumber's output hides the Playwright result. $! holds Cucumber's error.
    playwright_lines = PLAYWRIGHT_ROLLUP.values_at(:functional, :eyes).compact
    unless playwright_lines.empty?
      cucumber = $! ? "❌ Cucumber: #{$!.message}." : '✅ Cucumber: passed.'
      ChatClient.log ['UI suites:', *playwright_lines, cucumber].join("\n")
    end

    # After the log reads $!, and only if nothing else failed. A raise here
    # replaces the current error.
    raise playwright_failure if playwright_failure && $!.nil?
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
    if CI::Utils.tagged?(SKIP_UI_TESTS_TAG)
      ChatClient.log "Commit message: '#{CI::Utils.git_commit_message}' contains [#{SKIP_UI_TESTS_TAG}], skipping UI tests for this run."
      next
    end

    Dir.chdir('dashboard') do
      if CI::Utils.tagged?(RESET_DB_TAG)
        ChatClient.log "Commit message: '#{CI::Utils.git_commit_message}' contains [#{RESET_DB_TAG}], resetting dashboard database."
        RakeUtils.rake_stream_output 'db:reset db:setup_or_migrate'
      end
      RakeUtils.rake_stream_output 'seed:ui_test'
    end
  end

  timed_task_with_logging :force_seed_ui_test do
    Dir.chdir('dashboard') do
      RakeUtils.rake_stream_output 'seed:ui_test'
    end
  end

  timed_task_with_logging :check_for_new_file_changes do
    check_for_new_file_changes
  end
end

# @return [Array<String>] names of Device Farm browser configurations for this test run.
# Returns an empty array to use all browsers defined in browsers_device_farm.json.
# Individual browsers can be selected using the same commit tags as SauceLabs,
# filtered to only those supported by Device Farm (Chrome and Firefox).
# Note: mobile Device Farm configs (iPhone, iPad) exist in browsers_device_farm.json
# but are not routed from CI tags today; use them locally via
# `runner.rb --device-farm --config iPhone`.
def device_farm_browsers_to_run
  browsers = []
  browsers << 'Chrome' unless CI::Utils.tagged?(SKIP_CHROME_TAG)
  browsers << 'Firefox' if CI::Utils.tagged?(TEST_FIREFOX_TAG) || CI::Utils.tagged?(TEST_ALL_BROWSERS_TAG)
  browsers
end

# @return [Array<String>] Playwright projects for this run, from the same tags as
#   the browsers above. There is no iPad or iPhone project. Its webkit is
#   Safari's engine, not Safari.
def playwright_browsers_to_run
  browsers = []
  browsers << 'chromium' unless CI::Utils.tagged?(SKIP_CHROME_TAG)
  browsers << 'firefox' if CI::Utils.tagged?(TEST_FIREFOX_TAG) || CI::Utils.tagged?(TEST_ALL_BROWSERS_TAG)
  browsers << 'webkit' if CI::Utils.tagged?(TEST_SAFARI_TAG) || CI::Utils.tagged?(TEST_ALL_BROWSERS_TAG)
  browsers
end

# @return [Array<String>] names of browser configurations for this test run
def saucelabs_browsers_to_run
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
  else
    ChatClient.log 'No changes to schema.rb detected.'
  end

  if GitUtils.changed_in_branch_or_local?(GitUtils.current_branch, ['dashboard/app/models/**/*'])
    RakeUtils.system_stream_output('git diff -- dashboard/app/models | cat')
    raise 'Unexpected change to dashboard/app/models - Make sure you run your migration locally and push those changes into your branch.'
  else
    ChatClient.log 'No changes to dashboard/app/models detected.'
  end
end
