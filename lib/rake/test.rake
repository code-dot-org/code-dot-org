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
      run_tests_if_changed('apps', ['apps/*', 'blockly-core/*', 'shared/*.js', 'shared/*.css']) do
        TestRunUtils.run_apps_tests
      end
    end

    desc 'Runs code-studio tests if code-studio might have changed from staging.'
    task :code_studio do
      run_tests_if_changed('code-studio', ['code-studio/*', 'apps/*']) do
        TestRunUtils.run_code_studio_tests
      end
    end

    desc 'Runs blockly-core tests if blockly-core might have changed from staging.'
    task :blockly_core do
      run_tests_if_changed('blockly-core', ['blockly-core/*']) do
        TestRunUtils.run_blockly_core_tests
      end
    end

    desc 'Runs dashboard tests if dashboard might have changed from staging.'
    task :dashboard do
      run_tests_if_changed('dashboard', ['dashboard/*', 'lib/*', 'shared/*']) do
        TestRunUtils.run_dashboard_tests
      end
    end

    desc 'Runs pegasus tests if pegasus might have changed from staging.'
    task :pegasus do
      run_tests_if_changed('pegasus', ['pegasus/*', 'lib/*', 'shared/*']) do
        TestRunUtils.run_pegasus_tests
      end
    end

    desc 'Runs shared tests if shared might have changed from staging.'
    task :shared do
      run_tests_if_changed('shared', ['shared/*']) do
        TestRunUtils.run_shared_tests
      end
    end

    task all: [:apps, :code_studio, :blockly_core, :dashboard, :pegasus, :shared]
  end

  task changed: ['changed:all']

  task all: [:apps, :code_studio, :blockly_core, :dashboard, :pegasus, :shared]
end
task test: ['test:changed']

def run_tests_if_changed(identifier, changed_globs)
  base_branch = GitUtils.current_branch_base
  if GitUtils.changed_in_branch_or_local?(base_branch, changed_globs)
    HipChat.log "Files affecting tests *modified* from #{base_branch}. Starting tests for: #{identifier} "
    yield
  else
    HipChat.log "Files affecting tests unmodified from #{base_branch}. Skipping tests for: #{identifier} "
  end
end
