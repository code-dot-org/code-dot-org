# == Schema Information
#
# Table name: code_review_notes
#
#  id                     :bigint           not null, primary key
#  code_review_request_id :integer          not null
#  commenter_id           :integer          not null
#  is_resolved            :boolean          not null
#  comment                :text(16777215)   not null
#  deleted_at             :datetime
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_code_review_notes_on_code_review_request_id  (code_review_request_id)
class CodeReviewNote < ApplicationRecord
  # TODO: This model will be renamed to CodeReviewComment once the old models are
  # removed.

  belongs_to :commenter, class_name: 'User'

  acts_as_paranoid

  def summarize
    {
      id: id,
      commenterName: commenter.name,    # TODO: handle deleted user
      comment: comment,
      isResolved: is_resolved,
      createdAt: created_at
    }
  end
end
