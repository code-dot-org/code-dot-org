require 'cdo/rake_utils'
require 'cdo/git_utils'

RUN_UI_TESTS_TAG = '[test ui]'
RUN_ALL_TESTS_TAG = '[test all]'
BUILD_ALL_TAG = '[build all]'

def should_build_all
  GitUtils.circle_commit_contains?(RUN_ALL_TESTS_TAG) ||
      GitUtils.circle_commit_contains?(BUILD_ALL_TAG)
end

namespace :circle do
  desc 'Inserts build_my and use_my triggers for this circle test run.'
  task :write_locals_yml do
    locals_file = deploy_dir('locals.yml')
    RakeUtils.update_yml(locals_file) do |hash|
      if should_build_all
        hash['build_apps'] = true
        hash['use_my_apps'] = true
        hash['build_code_studio'] = true
        hash['use_my_code_studio'] = true
        hash['build_shared_js'] = true
        hash['use_my_shared_js'] = true
        hash['build_blockly_core'] = true
        hash['build_dashboard'] = true
        hash['build_pegasus'] = true
        return
      end

      build_my_if_changed('apps', ['apps/**/*', 'blockly-core/**/*', 'shared/**/*.js', 'shared/**/*.css']) do
        hash['build_apps'] = true
        hash['use_my_apps'] = true
      end

      build_my_if_changed('code-studio', ['code-studio/**/*', 'apps/**/*']) do
        hash['build_code_studio'] = true
        hash['use_my_code_studio'] = true
      end

      build_my_if_changed('shared', ['shared/**/*', 'lib/**/*']) do
        hash['build_shared_js'] = true
        hash['use_my_shared_js'] = true
      end

      build_my_if_changed('blockly-core', ['blockly-core/**/*']) do
        hash['build_blockly_core'] = true
      end

      build_my_if_changed('dashboard', ['dashboard/**/*', 'lib/**/*', 'shared/**/*']) do
        hash['build_dashboard'] = true
      end

      build_my_if_changed('pegasus', ['pegasus/**/*', 'lib/**/*', 'shared/**/*']) do
        hash['build_pegasus'] = true
      end
    end
  end

  desc 'Runs tests for changed sub-folders, or all tests if the tag specified is present in the most recent commit message.'
  task :run_tests do
    if GitUtils.circle_commit_contains?(RUN_ALL_TESTS_TAG)
      HipChat.log "Commit message: '#{GitUtils.circle_commit_message}' contains #{RUN_ALL_TESTS_TAG}, force-running all tests."
      RakeUtils.rake_stream_output 'test:all'
    else
      RakeUtils.rake_stream_output 'test:changed'
    end
  end

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
    if GitUtils.circle_commit_contains?(RUN_UI_TESTS_TAG)
      HipChat.log "Commit message: '#{GitUtils.circle_commit_message}' contains #{RUN_UI_TESTS_TAG}, running UI tests."
      # Re-seed levels (some scripts become unavailable after unit tests run?)
      Dir.chdir('dashboard') do
        RakeUtils.rake_stream_output 'seed:all'
      end
      RakeUtils.exec_in_background 'RACK_ENV=test RAILS_ENV=test ./bin/dashboard-server'
      RakeUtils.system_stream_output 'wget https://saucelabs.com/downloads/sc-4.3.15-linux.tar.gz'
      RakeUtils.system_stream_output 'tar -xzf sc-4.3.15-linux.tar.gz'
      Dir.chdir(Dir.glob('sc-*-linux')[0]) do
        RakeUtils.exec_in_background './bin/sc -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY'
      end
      RakeUtils.system_stream_output 'until $(curl --output /dev/null --silent --head --fail http://localhost.studio.code.org:3000); do sleep 5; done'
      Dir.chdir('dashboard/test/ui') do
        RakeUtils.system_stream_output 'bundle exec ./runner.rb -c ChromeLatestWin7 -p localhost.code.org:3000 -d localhost.studio.code.org:3000 --circle --parallel 35 --retry_count 3 --html'
      end
    else
      HipChat.log "Commit message: '#{GitUtils.circle_commit_message}' does not contain #{RUN_UI_TESTS_TAG}, skipping UI tests."
    end
  end
end

def build_my_if_changed(test_name, changed_globs)
  base_branch = GitUtils.current_branch_base
  max_identifier_length = 12
  justified_test_name = test_name.ljust(max_identifier_length)

  relevant_changed_files = GitUtils.files_changed_in_branch_or_local(base_branch, changed_globs)
  if relevant_changed_files.empty?
    HipChat.log "Files affecting the #{justified_test_name} build unmodified from #{base_branch}. Using existing build."
  else
    HipChat.log "Files affecting the #{justified_test_name} build *modified* from #{base_branch}. Using 'my' build. Changed files:"
    padding = ' ' * 4
    separator = "\n"
    HipChat.log separator + padding + relevant_changed_files.join(separator + padding)
    yield
  end
end
