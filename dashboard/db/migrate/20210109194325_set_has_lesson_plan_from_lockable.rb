class SetHasLessonPlanFromLockable < ActiveRecord::Migration[5.2]
  def up
    Lesson.all.each do |lesson|
      lesson.has_lesson_plan = !lesson.lockable
      lesson.save!
    end
    scripts = ['csp1-2020', 'csp2-2020', 'csp3-2020', 'csp4-2020', 'csp5-2020', 'csp6-2020', 'csp7-2020', 'csp8-2020', 'csp9-2020', 'csp10-2020', 'csp1-2021', 'csp2-2021', 'csp3-2021', 'csp4-2021', 'csp5-2021', 'csp6-2021', 'csp7-2021', 'csp8-2021', 'csp9-2021', 'csp10-2021']
    scripts.each do |script|
      lesson = Script.find_by(name: script).lessons.last
      lesson.has_lesson_plan = true
      lesson.save!
    end
  end

  def down
  end
end
