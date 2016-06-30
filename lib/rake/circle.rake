require 'cdo/rake_utils'
require 'cdo/git_utils'

RUN_UI_TESTS_TAG = '[test ui]'
RUN_ALL_TESTS_TAG = '[test all]'
BUILD_ALL_TAG = '[build all]'

def build_all?
  GitUtils.circle_commit_contains?(RUN_ALL_TESTS_TAG) ||
      GitUtils.circle_commit_contains?(BUILD_ALL_TAG)
end

def running_ui_tests?
  GitUtils.circle_commit_contains?(RUN_UI_TESTS_TAG)
end

namespace :circle do
  desc 'Inserts build_my and use_my triggers for this circle test run.'
  task :write_locals_yml do
    locals_file = deploy_dir('locals.yml')
    RakeUtils.update_yml(locals_file) do |yml_hash|
      if build_all?
        yml_hash['build_apps'] = true
        yml_hash['use_my_apps'] = true
        yml_hash['build_code_studio'] = true
        yml_hash['use_my_code_studio'] = true
        yml_hash['build_shared_js'] = true
        yml_hash['use_my_shared_js'] = true
        yml_hash['build_blockly_core'] = true
        yml_hash['build_dashboard'] = true
        yml_hash['build_pegasus'] = true
        return
      end

      GitUtils.build_my_if_changed('apps', ['apps/**/*', 'blockly-core/**/*', 'shared/**/*.js', 'shared/**/*.css']) do
        yml_hash['build_apps'] = true
        yml_hash['use_my_apps'] = true
      end

      GitUtils.build_my_if_changed('code-studio', ['code-studio/**/*', 'apps/**/*']) do
        yml_hash['build_code_studio'] = true
        yml_hash['use_my_code_studio'] = true
      end

      GitUtils.build_my_if_changed('shared', ['shared/**/*', 'lib/**/*']) do
        yml_hash['build_shared_js'] = true
        yml_hash['use_my_shared_js'] = true
      end

      GitUtils.build_my_if_changed('blockly-core', ['blockly-core/**/*']) do
        yml_hash['build_blockly_core'] = true
      end

      GitUtils.build_my_if_changed('dashboard', ['dashboard/**/*', 'lib/**/*', 'shared/**/*']) do
        yml_hash['build_dashboard'] = true
      end

      GitUtils.build_my_if_changed('pegasus', ['pegasus/**/*', 'lib/**/*', 'shared/**/*']) do
        yml_hash['build_pegasus'] = true
      end

      if running_ui_tests?
        yml_hash['build_dashboard'] = true
        yml_hash['build_pegasus'] = true
      end
    end
  end

  desc 'Runs tests for changed sub-folders, or all tests if the tag specified is present in the most recent commit message.'
  task :run_tests do
    if GitUtils.circle_commit_contains?(RUN_ALL_TESTS_TAG)
      HipChat.log "Commit message: '#{GitUtils.latest_commit_message}' contains #{RUN_ALL_TESTS_TAG}, force-running all tests."
      RakeUtils.rake_stream_output 'test:all'
    else
      RakeUtils.rake_stream_output 'test:changed'
    end
  end

  desc 'Runs UI tests only if the tag specified is present in the most recent commit message.'
  task :run_ui_tests do
    if running_ui_tests?
      HipChat.log "Commit message: '#{GitUtils.latest_commit_message}' contains #{RUN_UI_TESTS_TAG}, running UI tests."
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
        RakeUtils.system_stream_output 'bundle exec ./runner.rb -c ChromeLatestWin7 -p localhost.code.org:3000 -d localhost.studio.code.org:3000 --circle --parallel 15 --retry_count 1 --html'
      end
    else
      HipChat.log "Commit message: '#{GitUtils.latest_commit_message}' does not contain #{RUN_UI_TESTS_TAG}, skipping UI tests."
    end
  end
end
