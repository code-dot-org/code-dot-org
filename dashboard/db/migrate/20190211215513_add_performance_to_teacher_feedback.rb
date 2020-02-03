class AddPerformanceToTeacherFeedback < ActiveRecord::Migration[5.0]
  def change
    add_column :teacher_feedbacks, :performance, :string
  end
end
