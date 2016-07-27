require 'cdo/rake_utils'
require 'cdo/git_utils'

namespace :craft do
  task :symlink do
    FileUtils.rm_rf apps_dir('src/craft/game')
    FileUtils.rm_rf apps_dir('static/skins/craft')
    RakeUtils.ln_s '../craft-private/src/js/game/', apps_dir('src/craft/game')
    RakeUtils.ln_s '../craft-private/src/assets/', apps_dir('static/skins/craft')
  end
end
