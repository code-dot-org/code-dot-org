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

  desc 'Run a single eyes test.'
  task :ui do
    TestRunUtils.run_local_ui_test
  end

  desc 'Runs code studio tests.'
  task :code_studio do
    TestRunUtils.run_code_studio_tests
  end

  desc 'Runs blockly-core tests.'
  task :blockly_core do
    TestRunUtils.run_blockly_core_tests
  end

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

  namespace :changed do
    desc 'Runs apps tests if apps might have changed from staging.'
    task :apps do
      run_tests_if_changed('apps', ['apps/**/*', 'blockly-core/**/*', 'shared/**/*.js', 'shared/**/*.css']) do
        TestRunUtils.run_apps_tests
      end
    end

    desc 'Runs code-studio tests if code-studio might have changed from staging.'
    task :code_studio do
      run_tests_if_changed('code-studio', ['code-studio/**/*', 'apps/**/*']) do
        TestRunUtils.run_code_studio_tests
      end
    end

    desc 'Runs blockly-core tests if blockly-core might have changed from staging.'
    task :blockly_core do
      run_tests_if_changed('blockly-core', ['blockly-core/**/*']) do
        TestRunUtils.run_blockly_core_tests
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

    task all: [:apps, :code_studio, :blockly_core, :dashboard, :pegasus, :shared]
  end

  task changed: ['changed:all']

  task all: [:apps, :code_studio, :blockly_core, :dashboard, :pegasus, :shared]
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
