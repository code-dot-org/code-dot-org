class AddMetricsToUserFeedbacks < ActiveRecord::Migration[5.0]
  def change
    add_column :teacher_feedbacks, :student_visit_count, :integer
    add_column :teacher_feedbacks, :student_initial_visited_at, :timestamp
    add_column :teacher_feedbacks, :student_most_recent_visited_at, :timestamp
  end
end
