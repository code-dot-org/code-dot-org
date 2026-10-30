class CreateUserLessonReflections < ActiveRecord::Migration[7.0]
  def change
    create_table :user_lesson_reflections, charset: "utf8mb4", collation: "utf8mb4_unicode_ci" do |t|
      t.integer :lesson_id, null: false
      t.bigint :student_id, null: false
      t.text :success
      t.text :struggle

      t.timestamps
    end

    add_index :user_lesson_reflections, :lesson_id
    add_index :user_lesson_reflections, :student_id
    add_index :user_lesson_reflections, [:lesson_id, :student_id]
  end
end
