class AddIndexToTeacherFeedbacks < ActiveRecord::Migration[5.2]
  def change
    add_index :teacher_feedbacks, :teacher_id
  end
end
