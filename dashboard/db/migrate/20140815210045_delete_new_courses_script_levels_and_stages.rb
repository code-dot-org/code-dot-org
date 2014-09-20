class DeleteNewCoursesScriptLevelsAndStages < ActiveRecord::Migration
  def change
    # one time migration. not to be run again

#    new_scripts = Script.where(name: 'course1') + Script.where(name: 'course2') + Script.where(name: 'course3')
#    new_scripts.each{|script| script.script_levels.destroy_all}
#    new_scripts.each{|script| script.stages.destroy_all}
#    require 'rake'
#    Rake::Task.clear
#    Dashboard::Application.load_tasks
#    Rake::Task['seed:all'].invoke # will re-seed scripts
  end
end
