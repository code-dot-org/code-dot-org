class FixScriptLevelPositions < ActiveRecord::Migration[4.2]
  def change
    # One time migration, not to be run again.
    #    Script.all.each{|script| script.stages.destroy_all}
    #    require 'rake'
    #    Rake::Task.clear
    #    Dashboard::Application.load_tasks
    #    Rake::Task['seed:all'].invoke # will re-seed scripts
  end
end
