# coding: utf-8
# Run 'rake' or 'rake -P' to get a list of valid Rake commands.

require 'cdo/chat_client'
require 'cdo/test_run_utils'
require 'cdo/rake_utils'
require 'cdo/git_utils'
require 'cdo/lighthouse'
require 'parallel'
require 'aws-sdk-s3'
require 'cdo/mysql_console_helper'

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
      ChatClient.log 'Running <b>dashboard</b> UI tests...'
      failed_browser_count = RakeUtils.system_with_chat_logging(
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
  end

  task :eyes_ui do
    Dir.chdir(dashboard_dir('test/ui')) do
      ChatClient.log 'Running <b>dashboard</b> UI visual tests...'
      eyes_features = `find features/ -name "*.feature" | xargs grep -lr '@eyes'`.split("\n")
      failed_browser_count = RakeUtils.system_with_chat_logging(
        'bundle', 'exec', './runner.rb',
        '-c', 'Chrome,iPhone,IE11',
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
  end

  desc 'Run Lighthouse audits against key pages (currently Code Studio homepage).'
  task :lighthouse do
    Lighthouse.report CDO.studio_url('', CDO.default_scheme)
  end

  # Run the eyes tests and ui test suites in parallel. If one of these suites
  # raises, allow the other suite to complete, then make sure this task raises.
  task :ui_all do
    Parallel.each([:eyes_ui, :regular_ui, :lighthouse], in_threads: 3) do |target|
      Rake::Task["test:#{target}"].invoke
    end
  end

  task :wait_for_test_server do
    RakeUtils.wait_for_url CDO.studio_url('', CDO.default_scheme)
  end

  task ui_live: [
    :wait_for_test_server,
    :ui_all
  ]

  task :dashboard_ci do
    Dir.chdir(dashboard_dir) do
      ChatClient.wrap('dashboard ruby unit tests') do
        ENV['DISABLE_SPRING'] = '1'
        ENV['UNIT_TEST'] = '1'
        ENV['USE_PEGASUS_UNITTEST_DB'] = '1'
        ENV['CODECOV_FLAGS'] = 'dashboard'
        ENV['PARALLEL_TEST_FIRST_IS_1'] = '1'
        # Parallel tests don't seem to run more quickly over 16 processes.
        ENV['PARALLEL_TEST_PROCESSORS'] = '16' if RakeUtils.nproc > 16

        # Hash of all seed-data content: All fixture files plus schema.rb.
        fixture_path = "#{dashboard_dir}/test/fixtures/"
        fixture_hash = Digest::MD5.hexdigest(
          Dir["#{fixture_path}/{**,*}/*.yml"].
            push(dashboard_dir('db/schema.rb')).
            push(dashboard_dir('config/videos.csv')).
            select(&File.method(:file?)).
            sort.
            map(&Digest::MD5.method(:file)).
            join
        )
        CDO.log.info "Fixture hash: #{fixture_hash}"

        # Try to fetch seed data from S3
        bucket_name = 'cdo-build-package'
        s3_key = "test_db/#{fixture_hash}.gz"
        s3_client = Aws::S3::Client.new
        require 'zlib'
        require 'stringio'

        seed_data = begin
          response = s3_client.get_object(bucket: bucket_name, key: s3_key)
          Zlib::GzipReader.new(response.body).read
        rescue Aws::Errors::MissingCredentialsError, Aws::S3::Errors::ServiceError
          CDO.log.info "Seed data not found on S3 at #{s3_key}"
          nil
        end

        seed_file = Tempfile.new(['db_seed', '.sql'])
        auto_inc = 's/ AUTO_INCREMENT=[0-9]*\b//'
        writer = URI.parse(CDO.dashboard_db_writer || 'mysql://root@localhost/dashboard_test')
        database = writer.path[1..-1]
        writer.path = ''
        opts = MysqlConsoleHelper.options(writer)
        mysqldump_opts = "mysqldump #{opts} --skip-comments --set-gtid-purged=OFF"

        if seed_data
          File.write(seed_file, seed_data)
        else
          # Generate new DB contents
          ENV['TEST_ENV_NUMBER'] = '1'
          RakeUtils.rake_stream_output 'db:create db:test:prepare'
          ENV.delete 'TEST_ENV_NUMBER'
          # Store new DB contents
          `#{mysqldump_opts} #{database}1 | sed '#{auto_inc}' > #{seed_file.path}`
          gzip_data = Zlib::GzipWriter.wrap(StringIO.new) {|gz| IO.copy_stream(seed_file.path, gz); gz.finish}.tap(&:rewind)

          s3_client.put_object(
            bucket: bucket_name,
            key: s3_key,
            body: gzip_data,
            acl: 'public-read'
          )
          CDO.log.info "Uploaded seed data to #{s3_key}"
        end

        cloned_data = `#{mysqldump_opts} #{database}2 | sed '#{auto_inc}'`
        if seed_data.equal?(cloned_data)
          CDO.log.info 'Test data not modified'
        else
          seed_2_file = Tempfile.new(['db_seed', '.sql'])
          File.write(seed_2_file, cloned_data)
          puts "Diff:\n"
          puts `diff #{seed_file.path} #{seed_2_file.path}`

          # Clone single DB across all databases
          require 'parallel_tests'
          procs = ParallelTests.determine_number_of_processes(nil)
          CDO.log.info "Test data modified, cloning across #{procs} databases..."
          databases = procs.times.map {|i| "#{database}#{i + 1}"}
          databases.each do |db|
            recreate_db = "DROP DATABASE IF EXISTS #{db}; CREATE DATABASE IF NOT EXISTS #{db};"
            RakeUtils.system_stream_output "echo '#{recreate_db}' | mysql #{opts}"
          end
          pipes = databases.map {|db| ">(mysql #{opts} #{db})"}.join(' ')
          RakeUtils.system_stream_output "/bin/bash -c 'tee <#{seed_file.path} #{pipes} >/dev/null'"
        end

        TestRunUtils.run_dashboard_tests(parallel: true)

        ENV.delete 'UNIT_TEST'
        ENV.delete 'USE_PEGASUS_UNITTEST_DB'
        ENV.delete 'CODECOV_FLAGS'
      end
    end
  end

  task :shared_ci do
    # isolate unit tests from the pegasus_test DB
    ENV['USE_PEGASUS_UNITTEST_DB'] = '1'
    TestRunUtils.run_shared_tests
    ENV.delete 'USE_PEGASUS_UNITTEST_DB'
  end

  task :pegasus_ci do
    # isolate unit tests from the pegasus_test DB
    ENV['USE_PEGASUS_UNITTEST_DB'] = '1'
    TestRunUtils.run_pegasus_tests
    ENV.delete 'USE_PEGASUS_UNITTEST_DB'
  end

  task :lib_ci do
    # isolate unit tests from the pegasus_test DB
    ENV['USE_PEGASUS_UNITTEST_DB'] = '1'
    TestRunUtils.run_lib_tests
    ENV.delete 'USE_PEGASUS_UNITTEST_DB'
  end

  task ci: [
    :shared_ci,
    :pegasus_ci,
    :dashboard_ci,
    :lib_ci,
    :ui_live
  ]

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
      run_tests_if_changed(
        'apps',
        [
          'apps/**/*',
          'dashboard/config/libraries/*.interpreted.js',
          'shared/js/**/*',
          'shared/css/**/*',
        ]
      ) do
        TestRunUtils.run_apps_tests
      end
    end

    task :interpreter do
      run_tests_if_changed('interpreter', ['apps/src/lib/tools/jsinterpreter/patchInterpreter.js']) do
        TestRunUtils.run_interpreter_tests
      end
    end

    desc 'Runs dashboard tests if dashboard might have changed from staging.'
    task :dashboard do
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
        ignore: ['dashboard/test/ui/**/*']
      ) do
        TestRunUtils.run_dashboard_tests
      end
    end

    desc 'Runs pegasus tests if pegasus might have changed from staging.'
    task :pegasus do
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
    task :shared do
      run_tests_if_changed('shared', ['Gemfile', 'Gemfile.lock', 'deployment.rb', 'shared/**/*', 'lib/**/*']) do
        TestRunUtils.run_shared_tests
      end
    end

    desc 'Runs lib tests if lib might have changed from staging.'
    task :lib do
      run_tests_if_changed('lib', ['Gemfile', 'Gemfile.lock', 'deployment.rb', 'lib/**/*']) do
        TestRunUtils.run_lib_tests
      end
    end

    all_tasks = [:apps,
                 # currently disabled because these tests take too long to run on circle
                 # :interpreter,
                 :dashboard,
                 :pegasus,
                 :shared,
                 :lib]

    task all_but_apps: all_tasks.reject {|t| t == :apps}

    task all: all_tasks
  end

  task changed: ['changed:all']

  task all: [:apps, :dashboard, :pegasus, :shared, :lib]
end
task test: ['test:changed']

# Some files are so fundamental to our test runner(s) that changes to them
# should cause us to run all tests.
GLOBS_AFFECTING_EVERYTHING = %w(
  .circleci/config.yml
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
