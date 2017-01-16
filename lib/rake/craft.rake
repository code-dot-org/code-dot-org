require 'cdo/rake_utils'

namespace :craft do
  desc 'Syncs changes within a checkout of craft-private with the craft designer app'
  task :update_designer do
    `rsync -arv #{File.expand_path('../../../../craft-private/src/js/game/*', __FILE__)} #{apps_dir('src/craft/designer/game')}`
    `rsync -arv #{File.expand_path('../../../../craft-private/src/assets/*', __FILE__)} #{apps_dir('static/skins/craft/designer')}`
  end

  desc 'Syncs changes within a checkout of craft-private with the craft simple app'
  task :update_simple do
    `rsync -arv #{File.expand_path('../../../../craft-private/src/js/game/*', __FILE__)} #{apps_dir('src/craft/simple/game')}`
    `rsync -arv #{File.expand_path('../../../../craft-private/src/assets/*', __FILE__)} #{apps_dir('static/skins/craft')}`
  end
end
