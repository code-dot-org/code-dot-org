class DeleteNewCoursesScriptLevelsAndStages < ActiveRecord::Migration[4.2]
  def change
    # One time migration, not to be run again.
    #    new_scripts = Unit.where(name: 'course1') + Unit.where(name: 'course2') + Unit.where(name: 'course3')
    #    new_scripts.each{|script| script.script_levels.destroy_all}
    #    new_scripts.each{|script| script.stages.destroy_all}
    #    require 'rake'
    #    Rake::Task.clear
    #    Dashboard::Application.load_tasks
    #    Rake::Task['seed:all'].invoke # will re-seed scripts
  end
end
