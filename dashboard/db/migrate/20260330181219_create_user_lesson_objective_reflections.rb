class CreateUserLessonObjectiveReflections < ActiveRecord::Migration[7.0]
  def change
    create_table :user_lesson_objective_reflections do |t|
      t.integer :objective_id, null: false
      t.bigint :student_id, null: false
      t.string :reflection

      t.timestamps
    end

    add_index :user_lesson_objective_reflections, :objective_id
    add_index :user_lesson_objective_reflections, :student_id
    add_index :user_lesson_objective_reflections, [:objective_id, :student_id]
  end
end
