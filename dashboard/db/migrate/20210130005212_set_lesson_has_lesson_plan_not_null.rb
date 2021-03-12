class SetLessonHasLessonPlanNotNull < ActiveRecord::Migration[5.2]
  def change
    change_column :stages, :has_lesson_plan, :boolean, null: false
  end
end
