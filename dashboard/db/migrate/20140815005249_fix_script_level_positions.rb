class FixScriptLevelPositions < ActiveRecord::Migration
  def change
    # one time migration. not to be run again

#    Script.all.each{|script| script.stages.destroy_all}
#    require 'rake'
#    Rake::Task.clear
#    Dashboard::Application.load_tasks
#    Rake::Task['seed:all'].invoke # will re-seed scripts
  end
end
