class AddSeenToTeacherFeedbacks < ActiveRecord::Migration[5.0]
  def change
    add_column :teacher_feedbacks, :seen, :boolean, default: false
    add_column :teacher_feedbacks, :seen_at, :datetime
  end
end
