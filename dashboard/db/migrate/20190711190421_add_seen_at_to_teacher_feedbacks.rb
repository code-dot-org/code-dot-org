class AddSeenAtToTeacherFeedbacks < ActiveRecord::Migration[5.0]
  def change
    add_column :teacher_feedbacks, :seen_on_feedback_page_at, :datetime
  end
end
