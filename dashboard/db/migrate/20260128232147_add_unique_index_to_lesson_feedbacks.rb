class AddUniqueIndexToLessonFeedbacks < ActiveRecord::Migration[6.1]
  def change
    add_index :lesson_feedbacks,
      [:lesson_id, :student_id],
      unique: true,
      name: "index_lesson_feedbacks_on_lesson_student"
  end
end
