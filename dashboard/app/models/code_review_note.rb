# == Schema Information
#
# Table name: code_review_notes
#
#  id                     :bigint           not null, primary key
#  code_review_request_id :integer          not null
#  commenter_id           :integer
#  is_resolved            :boolean          not null
#  comment                :text(16777215)
#  deleted_at             :datetime
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_code_review_notes_on_code_review_request_id  (code_review_request_id)
#
class CodeReviewNote < ApplicationRecord
  # TODO: This model will be renamed to CodeReviewComment once the old models are
  # removed.

  belongs_to :commenter, class_name: 'User', optional: true
  # TODO: When the column is renamed, update this association
  belongs_to :code_review, class_name: 'CodeReview', foreign_key: :code_review_request_id, optional: true

  acts_as_paranoid

  def summarize
    {
      id: id,
      commenterName: commenter&.name,
      commenterId: commenter&.id,
      comment: comment,
      isResolved: is_resolved,
      createdAt: created_at,
      isFromTeacher: code_review.owner.memoized_teachers.include?(commenter)
    }
  end
end
