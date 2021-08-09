class AddReviewStateToTeacherFeedbacks < ActiveRecord::Migration[5.2]
  def change
    add_column :teacher_feedbacks, :review_state, :string
  end
end
