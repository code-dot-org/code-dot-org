# Run 'rake' or 'rake -P' to get a list of valid Rake commands.

require 'cdo/chat_client'
require 'cdo/test_run_utils'
require 'cdo/rake_utils'
require 'cdo/git_utils'
require 'cdo/lighthouse'
require 'parallel'
require 'aws-sdk-s3'
require 'cdo/mysql_console_helper'
require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

namespace :test do
  desc 'Runs apps tests.'
  timed_task_with_logging :apps do
    TestRunUtils.run_apps_tests
  end

  desc 'Run a single eyes test locally using chromedriver.'
  timed_task_with_logging :ui do
    TestRunUtils.run_local_ui_test
  end

  timed_task_with_logging :regular_ui do
    ChatClient.log 'Running <b>dashboard</b> UI tests...'
    failed_browser_count = RakeUtils.system_with_chat_logging(
      "cd #{dashboard_dir('test/ui')} &&",
      'bundle', 'exec', './runner.rb',
      '-d', CDO.site_host('studio.code.org'),
      '-p', CDO.site_host('code.org'),
      '--db', # Ensure features that require database access are run even if the server name isn't "test"
      '--parallel', '120',
      '--magic_retry',
      '--with-status-page',
      '--fail_fast',
      '--priority 0'
    )
    if failed_browser_count == 0
      message = '┬──┬ ﻿ノ( ゜-゜ノ) UI tests for <b>dashboard</b> succeeded.'
      ChatClient.log message
      ChatClient.message 'server operations', message, color: 'green'
    else
      message = "(╯°□°）╯︵ ┻━┻ UI tests for <b>dashboard</b> failed on #{failed_browser_count} browser(s)."
      ChatClient.log message, color: 'red'
      ChatClient.message 'server operations', message, color: 'red', notify: 1
      raise "UI tests failed"
    end
  end

  timed_task_with_logging :eyes_ui do
    ChatClient.log 'Running <b>dashboard</b> UI visual tests...'
    eyes_features = `cd #{dashboard_dir('test/ui')} && find features/ -name "*.feature" | xargs grep -lr '@eyes'`.split("\n")
    failed_browser_count = RakeUtils.system_with_chat_logging(
      "cd #{dashboard_dir('test/ui')} &&",
      'bundle', 'exec', './runner.rb',
      '-c', 'Chrome,iPhone',
      '-d', CDO.site_host('studio.code.org'),
      '-p', CDO.site_host('code.org'),
      '--db', # Ensure features that require database access are run even if the server name isn't "test"
      '--eyes',
      '--magic_retry',
      '--with-status-page',
      '-f', eyes_features.join(","),
      '--parallel', (eyes_features.count * 2).to_s
    )
    if failed_browser_count == 0
      message = '⊙‿⊙ Eyes tests for <b>dashboard</b> succeeded, no changes detected.'
      ChatClient.log message
      ChatClient.message 'server operations', message, color: 'green'
    else
      message = 'ಠ_ಠ Eyes tests for <b>dashboard</b> failed. See <a href="https://eyes.applitools.com/app/sessions/">the console</a> for results or to modify baselines.'
      ChatClient.log message, color: 'red'
      ChatClient.message 'server operations', message, color: 'red', notify: 1
      raise "Eyes tests failed"
    end
  end

  desc 'Run Lighthouse audits against key pages (currently Code Studio homepage).'
  timed_task_with_logging :lighthouse do
    Lighthouse.report CDO.studio_url('', CDO.default_scheme)
  end

  # Run the eyes tests and ui test suites in parallel. If one of these suites
  # raises, allow the other suite to complete, then make sure this task raises.
  timed_task_with_logging :ui_all do
    Parallel.each([:eyes_ui, :regular_ui], in_threads: 3) do |target|
      Rake::Task["test:#{target}"].invoke
    end
  end

  timed_task_with_logging :wait_for_test_server do
    RakeUtils.wait_for_url CDO.studio_url('', CDO.default_scheme)
  end

  timed_task_with_logging ui_live: [
    :wait_for_test_server,
    :ui_all
  ]

  # In each environment, we use the following databases by default:
  #  - databases for web servers: dashboard_<env> and pegasus_<env>
  #  - databases for unit tests: dashboard_test and pegasus_test
  #
  # On the chef-managed test system, where we run both unit and ui tests in the same environment,
  # this leads to conflicting names for both pegasus and dashboard. We work around this as follows:
  # - USE_PEGASUS_UNITTEST_DB=1 tells any unit tests to use pegasus_unittest instead of pegasus_test
  # - PARALLEL_TEST_FIRST_IS_1=1 tells the parallel_tests gem (which uses multiple test databases
  #   dashboard_test, dashboard_test2, etc. to run dashboard unit tests) to instead use
  #   dashboard_test1, dashboard_test2, etc.
  # - TEST_ENV_NUMBER=1 tells other ruby unit tests (not currently run in parallel) to use
  #   dashboard_test1 as well.
  #
  # No such workaround is currently needed for CI, because Drone runs unit tests and UI tests in
  # separate containers, so it is safe for both containers to use the default database names.
  # However, We still set PARALLEL_TEST_FIRST_IS_1=1 in the unit pipeline in CI to simplify
  # parallel database setup.

  timed_task_with_logging :dashboard_qa do
    Dir.chdir(dashboard_dir) do
      ChatClient.wrap('dashboard ruby unit tests') do
        ENV['DISABLE_SPRING'] = '1'
        ENV['UNIT_TEST'] = '1'
        ENV['USE_PEGASUS_UNITTEST_DB'] = '1'

        TestRunUtils.run_dashboard_tests(parallel: true, upload_seed_data: true)

        ENV.delete 'UNIT_TEST'
        ENV.delete 'USE_PEGASUS_UNITTEST_DB'
      end
    end
  end

  timed_task_with_logging :dashboard_legacy_qa do
    # isolate unit tests from the pegasus_test DB
    ENV['USE_PEGASUS_UNITTEST_DB'] = '1'
    ENV['TEST_ENV_NUMBER'] = '1'
    TestRunUtils.run_dashboard_legacy_tests
    ENV.delete 'TEST_ENV_NUMBER'
    ENV.delete 'USE_PEGASUS_UNITTEST_DB'
  end

  timed_task_with_logging :dashboard_hoc_legacy_engine_qa do
    # isolate unit tests from the pegasus_test DB
    ENV['USE_PEGASUS_UNITTEST_DB'] = '1'
    ENV['TEST_ENV_NUMBER'] = '1'
    TestRunUtils.run_dashboard_hoc_legacy_engine_tests
    ENV.delete 'TEST_ENV_NUMBER'
    ENV.delete 'USE_PEGASUS_UNITTEST_DB'
  end

  timed_task_with_logging :dashboard_cdo_contentful_engine_qa do
    # isolate unit tests from the pegasus_test DB
    ENV['USE_PEGASUS_UNITTEST_DB'] = '1'
    ENV['TEST_ENV_NUMBER'] = '1'
    TestRunUtils.run_dashboard_cdo_contentful_engine_tests
    ENV.delete 'TEST_ENV_NUMBER'
    ENV.delete 'USE_PEGASUS_UNITTEST_DB'
  end

  timed_task_with_logging :shared_qa do
    # isolate unit tests from the pegasus_test DB
    ENV['USE_PEGASUS_UNITTEST_DB'] = '1'
    ENV['TEST_ENV_NUMBER'] = '1'
    TestRunUtils.run_shared_tests
    ENV.delete 'TEST_ENV_NUMBER'
    ENV.delete 'USE_PEGASUS_UNITTEST_DB'
  end

  timed_task_with_logging :pegasus_qa do
    # isolate unit tests from the pegasus_test DB
    ENV['USE_PEGASUS_UNITTEST_DB'] = '1'
    ENV['TEST_ENV_NUMBER'] = '1'
    TestRunUtils.run_pegasus_tests
    ENV.delete 'TEST_ENV_NUMBER'
    ENV.delete 'USE_PEGASUS_UNITTEST_DB'
  end

  timed_task_with_logging :lib_qa do
    # isolate unit tests from the pegasus_test DB
    ENV['USE_PEGASUS_UNITTEST_DB'] = '1'
    ENV['TEST_ENV_NUMBER'] = '1'
    TestRunUtils.run_lib_tests
    ENV.delete 'TEST_ENV_NUMBER'
    ENV.delete 'USE_PEGASUS_UNITTEST_DB'
  end

  timed_task_with_logging :bin_qa do
    # isolate unit tests from the pegasus_test DB
    ENV['USE_PEGASUS_UNITTEST_DB'] = '1'
    ENV['TEST_ENV_NUMBER'] = '1'
    TestRunUtils.run_bin_tests
    ENV.delete 'TEST_ENV_NUMBER'
    ENV.delete 'USE_PEGASUS_UNITTEST_DB'
  end

  desc 'Runs full QA test pass (to be run on the chef-managed test system)'
  timed_task_with_logging qa: [
    :shared_qa,
    :pegasus_qa,
    :dashboard_qa,
    :dashboard_legacy_qa,
    :dashboard_hoc_legacy_engine_qa,
    :dashboard_cdo_contentful_engine_qa,
    :lib_qa,
    :bin_qa,
    :ui_live
  ]

  desc 'Runs dashboard tests.'
  timed_task_with_logging :dashboard do
    # This task can be run locally or in CI (the chef-managed test system uses dashboard_qa).
    # By default, we only want to run in parallel in CI to avoid overloading local machines.
    parallel = CI::Utils.ci_job_unit_tests?
    TestRunUtils.run_dashboard_tests(parallel: parallel)
  end

  desc 'Runs dashboard legacy tests.'
  timed_task_with_logging :dashboard_legacy do
    TestRunUtils.run_dashboard_legacy_tests
  end

  desc 'Runs dashboard cdo_contentful engine tests.'
  timed_task_with_logging :dashboard_cdo_contentful_engine do
    TestRunUtils.run_dashboard_cdo_contentful_engine_tests
  end

  desc 'Runs dashboard hoc_legacy engine tests.'
  timed_task_with_logging :dashboard_hoc_legacy_engine do
    TestRunUtils.run_dashboard_hoc_legacy_engine_tests
  end

  desc 'Runs pegasus tests.'
  timed_task_with_logging :pegasus do
    TestRunUtils.run_pegasus_tests
  end

  desc 'Runs shared tests.'
  timed_task_with_logging :shared do
    TestRunUtils.run_shared_tests
  end

  desc 'Runs lib tests.'
  timed_task_with_logging :lib do
    TestRunUtils.run_lib_tests
  end

  desc 'Runs python tests.'
  timed_task_with_logging :python do
    TestRunUtils.run_python_tests
  end

  desc 'Runs bin tests.'
  timed_task_with_logging :bin do
    TestRunUtils.run_bin_tests
  end

  desc 'Runs frontend tests.'
  timed_task_with_logging :frontend do
    TestRunUtils.run_frontend_tests
  end

  namespace :changed do
    desc 'Runs apps tests if apps might have changed from staging.'
    timed_task_with_logging :apps do
      run_tests_if_changed(
        'apps',
        [
          'apps/**/*',
          'dashboard/config/libraries/*.interpreted.js',
          'shared/js/**/*',
          'shared/css/**/*',
          'frontend/**/*',
          'lib/cdo/shared_constants/**/*',
          'lib/cdo/shared_constants.rb',
        ]
      ) do
        TestRunUtils.run_apps_tests
      end
    end

    desc 'Runs dashboard tests if dashboard might have changed from staging.'
    timed_task_with_logging :dashboard do
      run_tests_if_changed(
        'dashboard',
        [
          'Gemfile',
          'Gemfile.lock',
          'deployment.rb',
          'dashboard/**/*',
          'lib/**/*',
          'shared/**/*'
        ],
        ignore: ['dashboard/test/ui/**/*', 'dashboard/db/schema_cache.yml']
      ) do
        # This task is typically only run in CI, so gate on CI just as a safeguard
        # in case a developer tries to run it locally.
        parallel = CI::Utils.ci_job_unit_tests?
        TestRunUtils.run_dashboard_tests(parallel: parallel)
      end
    end

    desc 'Runs dashboard_legacy tests if dashboard/legacy might have changed from staging.'
    timed_task_with_logging :dashboard_legacy do
      run_tests_if_changed(
        'dashboard legacy',
        [
          'Gemfile',
          'Gemfile.lock',
          'deployment.rb',
          'dashboard/legacy/**/*',
          'lib/**/*',
          'shared/**/*'
        ],
        ignore: ['dashboard/test/ui/**/*', 'dashboard/db/schema_cache.yml']
      ) do
        TestRunUtils.run_dashboard_legacy_tests
      end
    end

    desc 'Runs dashboard cdo_contentful engine tests'
    timed_task_with_logging :dashboard_cdo_contentful_engine do
      run_tests_if_changed(
        'dashboard cdo_contentful engine',
        %w[Gemfile Gemfile.lock dashboard/engines/cdo_contentful/**/*],
      ) do
        TestRunUtils.run_dashboard_cdo_contentful_engine_tests
      end
    end

    desc 'Runs dashboard hoc_legacy engine tests if dashboard might have changed from staging.'
    timed_task_with_logging :dashboard_hoc_legacy_engine do
      run_tests_if_changed(
        'dashboard hoc_legacy engine',
        [
          'Gemfile',
          'Gemfile.lock',
          'deployment.rb',
          'dashboard/**/*',
          'lib/**/*',
          'shared/**/*'
        ],
        ignore: ['dashboard/test/ui/**/*', 'dashboard/db/schema_cache.yml']
      ) do
        TestRunUtils.run_dashboard_hoc_legacy_engine_tests
      end
    end

    desc 'Runs pegasus tests if pegasus might have changed from staging.'
    timed_task_with_logging :pegasus do
      run_tests_if_changed(
        'pegasus',
        [
          'Gemfile',
          'Gemfile.lock',
          'deployment.rb',
          'pegasus/**/*',
          'lib/**/*',
          'shared/**/*',
          'dashboard/db/schema.rb'
        ]
      ) do
        TestRunUtils.run_pegasus_tests
      end
    end

    desc 'Runs shared tests if shared might have changed from staging.'
    timed_task_with_logging :shared do
      run_tests_if_changed(
        'shared',
        [
          'Gemfile',
          'Gemfile.lock',
          'deployment.rb',
          'shared/**/*',
          'lib/**/*',
        ]
      ) do
        TestRunUtils.run_shared_tests
      end
    end

    desc 'Runs lib tests if lib might have changed from staging.'
    timed_task_with_logging :lib do
      run_tests_if_changed(
        'lib',
        [
          'Gemfile',
          'Gemfile.lock',
          'deployment.rb',
          'lib/**/*',
          'config/**/*'
        ]
      ) do
        TestRunUtils.run_lib_tests
      end
    end

    desc 'Runs python tests if python might have changed from staging.'
    task :python do
      run_tests_if_changed(
        'python',
        [
          'pyproject.toml',
          'uv.lock',
          'python/**/*',
          'lib/cdo/python_venv.py',
          'Gemfile',
          'Gemfile.lock',
          'deployment.rb',
          'config/**/*',
        ]
      ) do
        TestRunUtils.run_python_tests
      end
    end

    desc 'Runs lib tests if lib might have changed from staging.'
    timed_task_with_logging :bin do
      run_tests_if_changed(
        'bin',
        [
          'Gemfile',
          'Gemfile.lock',
          'deployment.rb',
          'bin/**/*',
          # i18n tests depend on curriculum models
          'dashboard/app/models/**/*'
        ]
      ) do
        TestRunUtils.run_bin_tests
      end
    end

    all_tasks = [
      :frontend,
      :apps,
      # currently disabled because these tests take too long to run on CI
      # :interpreter,
      :dashboard,
      :dashboard_legacy,
      :dashboard_cdo_contentful_engine,
      :dashboard_hoc_legacy_engine,
      :pegasus,
      :shared,
      :lib,
      :python,
      :bin
    ]

    timed_task_with_logging all_but_apps: all_tasks.reject {|t| t == :apps}

    timed_task_with_logging all: all_tasks
  end

  timed_task_with_logging changed: ['changed:all']

  timed_task_with_logging all: [
    :frontend,
    :apps,
    :dashboard,
    :dashboard_legacy,
    :dashboard_cdo_contentful_engine,
    :dashboard_hoc_legacy_engine,
    :pegasus,
    :shared,
    :lib,
    :bin,
  ]
end
timed_task_with_logging test: ['test:changed']

# Some files are so fundamental to our test runner(s) that changes to them
# should cause us to run all tests.
GLOBS_AFFECTING_EVERYTHING = %w(
  .drone.yml
  lib/rake/test.rake
)

def run_tests_if_changed(test_name, changed_globs, ignore: [])
  base_branch = GitUtils.current_branch_base
  max_identifier_length = 12
  justified_test_name = test_name.ljust(max_identifier_length)

  relevant_changed_files = GitUtils.files_changed_in_branch_or_local(
    base_branch,
    GLOBS_AFFECTING_EVERYTHING + changed_globs,
    ignore_patterns: ignore
  )
  if relevant_changed_files.empty?
    ChatClient.log "Files affecting #{justified_test_name} tests unmodified from #{base_branch}. Skipping tests."
  else
    ChatClient.log "Files affecting #{justified_test_name} tests *modified* from #{base_branch}. Starting tests. Changed files:"
    padding = ' ' * 4
    separator = "\n"
    ChatClient.log separator + padding + relevant_changed_files.join(separator + padding)
    yield
  end
end
