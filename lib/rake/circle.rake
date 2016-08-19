require 'cdo/rake_utils'
require 'cdo/git_utils'
require 'open-uri'
require 'json'

RUN_ALL_TESTS_TAG = '[test all]'

def merge_eyes_baselines(branch, base)
  RakeUtils.rake_stream_output "eyes:create[#{base}]"
  RakeUtils.rake_stream_output "eyes:merge[#{branch},#{base}]"
end

namespace :circle do
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
    RakeUtils.exec_in_background 'RACK_ENV=test RAILS_ENV=test bundle exec ./bin/dashboard-server'
    RakeUtils.system_stream_output 'wget https://saucelabs.com/downloads/sc-4.4.0-rc1-linux.tar.gz'
    RakeUtils.system_stream_output 'tar -xzf sc-4.4.0-rc1-linux.tar.gz'
    Dir.chdir(Dir.glob('sc-*-linux')[0]) do
      RakeUtils.exec_in_background './bin/sc -vv -l $CIRCLE_ARTIFACTS/sc.log -u $SAUCE_USERNAME -k $SAUCE_ACCESS_KEY -i CIRCLE-BUILD-$CIRCLE_BUILD_NUM --tunnel-domains localhost-studio.code.org,localhost.code.org'
    end
    RakeUtils.system_stream_output 'until $(curl --output /dev/null --silent --head --fail http://localhost.studio.code.org:3000); do sleep 5; done'
    Dir.chdir('dashboard/test/ui') do
      eyes_features = `grep -lr '@eyes' features`.split("\n")
      RakeUtils.system_stream_output 'bundle exec ./runner.rb -c ChromeLatestWin7,Firefox45Win7,IE11Win10,SafariYosemite -p localhost.code.org:3000 -d localhost.studio.code.org:3000 --circle --parallel 26 --retry_count 3 --html'
      RakeUtils.system_stream_output "bundle exec ./runner.rb --eyes -f #{eyes_features.join(',')} -c ChromeLatestWin7,iPhone -p localhost.code.org:3000 -d localhost.studio.code.org:3000 --circle --parallel 26 --retry_count 3 --html"
    end
  end

  desc 'Merges eyes test baselines from a branch if this is a run for a merge commit.'
  task :merge_eyes_baselines do
    begin
      commit_json = JSON.parse(open("https://api.github.com/repos/code-dot-org/code-dot-org/commits/#{RakeUtils.git_revision}").read)
      commit_merges_branch = commit_json['commit']['message'].match(/from code-dot-org\/(.*)\n\n/)[1]
      if commit_merges_branch
        HipChat.log "Commit appears to merge #{commit_merges_branch} into #{GitUtils.current_branch}"
        merge_eyes_baselines(commit_merges_branch, GitUtils.current_branch)
      end
    rescue => e
      HipChat.log "Eyes baseline not merged: #{e.message}"
    end
  end
end
