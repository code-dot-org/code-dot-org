class RemoveRedundantIndexFromTeacherFeedback < ActiveRecord::Migration[5.0]
  def change
    remove_index :teacher_feedbacks, name: "index_feedback_on_student_and_level"
  end
end
