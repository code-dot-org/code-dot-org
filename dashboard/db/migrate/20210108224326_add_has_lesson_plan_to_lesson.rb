class AddHasLessonPlanToLesson < ActiveRecord::Migration[5.2]
  def change
    add_column :stages, :has_lesson_plan, :boolean
  end
end
