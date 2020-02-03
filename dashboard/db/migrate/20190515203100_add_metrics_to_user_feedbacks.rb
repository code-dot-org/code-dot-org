class AddMetricsToUserFeedbacks < ActiveRecord::Migration[5.0]
  def change
    add_column :teacher_feedbacks, :student_visit_count, :integer
    add_column :teacher_feedbacks, :student_first_visited_at, :timestamp
    add_column :teacher_feedbacks, :student_last_visited_at, :timestamp
  end
end
