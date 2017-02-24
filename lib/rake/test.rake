# Run 'rake' or 'rake -P' to get a list of valid Rake commands.

require 'cdo/hip_chat'
require 'cdo/test_run_utils'
require 'cdo/rake_utils'
require 'cdo/git_utils'

namespace :test do
  desc 'Runs apps tests.'
  task :apps do
    TestRunUtils.run_apps_tests
  end

  desc 'Run a single eyes test locally using chromedriver.'
  task :ui do
    TestRunUtils.run_local_ui_test
  end

  task :regular_ui do
    Dir.chdir(dashboard_dir('test/ui')) do
      HipChat.log 'Running <b>dashboard</b> UI tests...'
      failed_browser_count = RakeUtils.system_with_hipchat_logging 'bundle', 'exec', './runner.rb', '-d', 'test-studio.code.org', '--parallel', '120', '--magic_retry', '--with-status-page', '--fail_fast'
      if failed_browser_count == 0
        message = '┬──┬ ﻿ノ( ゜-゜ノ) UI tests for <b>dashboard</b> succeeded.'
        HipChat.log message
        HipChat.message 'server operations', message, color: 'green'
      else
        message = "(╯°□°）╯︵ ┻━┻ UI tests for <b>dashboard</b> failed on #{failed_browser_count} browser(s)."
        HipChat.log message, color: 'red'
        HipChat.message 'server operations', message, color: 'red', notify: 1
      end
    end
  end

  task :eyes_ui do
    Dir.chdir(dashboard_dir('test/ui')) do
      HipChat.log 'Running <b>dashboard</b> UI visual tests...'
      eyes_features = `grep -lr '@eyes' features`.split("\n")
      failed_browser_count = RakeUtils.system_with_hipchat_logging 'bundle', 'exec', './runner.rb', '-c', 'ChromeLatestWin7,iPhone', '-d', 'test-studio.code.org', '--eyes', '--with-status-page', '-f', eyes_features.join(","), '--parallel', (eyes_features.count * 2).to_s
      if failed_browser_count == 0
        message = '⊙‿⊙ Eyes tests for <b>dashboard</b> succeeded, no changes detected.'
        HipChat.log message
        HipChat.message 'server operations', message, color: 'green'
      else
        message = 'ಠ_ಠ Eyes tests for <b>dashboard</b> failed. See <a href="https://eyes.applitools.com/app/sessions/">the console</a> for results or to modify baselines.'
        HipChat.log message, color: 'red'
        HipChat.message 'server operations', message, color: 'red', notify: 1
      end
    end
  end

  # do the eyes and sauce labs ui tests in parallel
  multitask ui_all: [:eyes_ui, :regular_ui]

  task :ui_test_flakiness do
    Dir.chdir(deploy_dir) do
      flakiness_output = `./bin/test_flakiness 5`
      HipChat.log "Flakiest tests: <br/><pre>#{flakiness_output}</pre>"
    end
  end

  task :wait_for_test_server do
    RakeUtils.wait_for_url 'https://test-studio.code.org'
  end

  task ui_live: [
    :ui_test_flakiness,
    :wait_for_test_server,
    :ui_all
  ]

  task :dashboard_ci do
    Dir.chdir(dashboard_dir) do
      HipChat.wrap('dashboard ruby unit tests') do
        # Unit tests mess with the database so stop the service before running them
        RakeUtils.stop_service CDO.dashboard_unicorn_name
        RakeUtils.rake 'db:test:prepare'
        ENV['DISABLE_SPRING'] = '1'
        ENV['UNIT_TEST'] = '1'
        TestRunUtils.run_dashboard_tests
        ENV.delete 'UNIT_TEST'
        RakeUtils.rake "seed:all"
        RakeUtils.start_service CDO.dashboard_unicorn_name
      end
    end
  end

  task ci: [:pegasus, :shared, :dashboard_ci, :ui_live]

  desc 'Runs dashboard tests.'
  task :dashboard do
    TestRunUtils.run_dashboard_tests
  end

  desc 'Runs pegasus tests.'
  task :pegasus do
    TestRunUtils.run_pegasus_tests
  end

  desc 'Runs shared tests.'
  task :shared do
    TestRunUtils.run_shared_tests
  end

  desc 'Runs lib tests.'
  task :lib do
    TestRunUtils.run_lib_tests
  end

  namespace :changed do
    desc 'Runs apps tests if apps might have changed from staging.'
    task :apps do
      run_tests_if_changed('apps', ['apps/**/*', 'shared/**/*.js', 'shared/**/*.css']) do
        TestRunUtils.run_apps_tests
      end
    end

    desc 'Runs dashboard tests if dashboard might have changed from staging.'
    task :dashboard do
      run_tests_if_changed('dashboard', ['dashboard/**/*', 'lib/**/*', 'shared/**/*']) do
        TestRunUtils.run_dashboard_tests
      end
    end

    desc 'Runs pegasus tests if pegasus might have changed from staging.'
    task :pegasus do
      run_tests_if_changed('pegasus', ['pegasus/**/*', 'lib/**/*', 'shared/**/*']) do
        TestRunUtils.run_pegasus_tests
      end
    end

    desc 'Runs shared tests if shared might have changed from staging.'
    task :shared do
      run_tests_if_changed('shared', ['shared/**/*', 'lib/**/*']) do
        TestRunUtils.run_shared_tests
      end
    end

    desc 'Runs lib tests if lib might have changed from staging.'
    task :lib do
      run_tests_if_changed('lib', ['lib/**/*']) do
        TestRunUtils.run_lib_tests
      end
    end

    task all: [:apps, :dashboard, :pegasus, :shared, :lib]
  end

  task changed: ['changed:all']

  task all: [:apps, :dashboard, :pegasus, :shared, :lib]
end
task test: ['test:changed']

def run_tests_if_changed(test_name, changed_globs)
  base_branch = GitUtils.current_branch_base
  max_identifier_length = 12
  justified_test_name = test_name.ljust(max_identifier_length)

  relevant_changed_files = GitUtils.files_changed_in_branch_or_local(base_branch, changed_globs)
  if relevant_changed_files.empty?
    HipChat.log "Files affecting #{justified_test_name} tests unmodified from #{base_branch}. Skipping tests."
  else
    HipChat.log "Files affecting #{justified_test_name} tests *modified* from #{base_branch}. Starting tests. Changed files:"
    padding = ' ' * 4
    separator = "\n"
    HipChat.log separator + padding + relevant_changed_files.join(separator + padding)
    yield
  end
end
