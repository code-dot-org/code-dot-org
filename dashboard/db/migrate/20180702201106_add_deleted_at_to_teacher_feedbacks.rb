class AddDeletedAtToTeacherFeedbacks < ActiveRecord::Migration[5.0]
  def change
    add_column :teacher_feedbacks, :deleted_at, :datetime, default: nil
  end
end
