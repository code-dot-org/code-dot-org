class SetHasLessonPlanFromLockable < ActiveRecord::Migration[5.2]
  def up
    Lesson.all.each do |lesson|
      lockable = !!lesson.lockable
      lesson.has_lesson_plan = !lockable
      lesson.save!
    end
    scripts = ['csp1-2021', 'csp2-2021', 'csp3-2021', 'csp4-2021', 'csp5-2021', 'csp6-2021', 'csp7-2021', 'csp9-2021', 'csp10-2021']
    scripts.each do |script_name|
      script = Script.find_by(name: script_name)
      next unless script
      lesson = script.lessons.last
      lesson.has_lesson_plan = true
      lesson.save!
    end
  end

  def down
  end
end
