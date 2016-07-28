require 'cdo/rake_utils'

namespace :craft do
  task :update do
    `rsync -arv #{File.expand_path('../../../../craft-private/src/js/game/*', __FILE__)} #{apps_dir('src/craft/game')}`
    `rsync -arv #{File.expand_path('../../../../craft-private/src/assets/*', __FILE__)} #{apps_dir('static/skins/craft')}`
  end
end
