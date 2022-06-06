# == Schema Information
#
# Table name: code_reviews
#
#  id                         :bigint           not null, primary key
#  user_id                    :integer          not null
#  project_id                 :integer          not null
#  script_id                  :integer          not null
#  level_id                   :integer          not null
#  project_level_id           :integer          not null
#  project_version            :string(255)      not null
#  project_version_expires_at :datetime
#  storage_id                 :integer          not null
#  closed_at                  :datetime
#  deleted_at                 :datetime
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#
# Indexes
#
#  index_code_reviews_for_peer_lookup               (user_id,script_id,project_level_id,closed_at,deleted_at)
#  index_code_reviews_on_project_id_and_deleted_at  (project_id,deleted_at)
#  index_code_reviews_unique                        (user_id,project_id,closed_at,deleted_at) UNIQUE
#
class CodeReview < ApplicationRecord
  acts_as_paranoid

  belongs_to :owner, class_name: 'User', foreign_key: :user_id
  # TODO: Once all the renaming has settled, the following association should be:
  # has_many :comments, class_name: 'CodeReviewComment', dependent:  :destroy
  has_many :comments, class_name: 'CodeReviewNote', foreign_key: 'code_review_request_id', dependent:  :destroy, inverse_of: 'code_review'

  # Enforce that each student can only have one open code review per script and
  # level. (This is also enforced at the database level with a unique index.)
  validates_uniqueness_of :user_id, scope: [:project_id],
    conditions: -> {where(closed_at: nil)},
    message: 'already has an open code review for this project'

  # Scope that includes only open code reviews
  scope :open_reviews, -> { where(closed_at: nil) }

  def self.open_for_project?(channel:)
    _, project_id = storage_decrypt_channel_id(channel)
    CodeReview.exists?(project_id: project_id, closed_at: nil)
  end

  # Returns whether the code review is open for adding more comments.
  def open?
    closed_at.nil?
  end

  # Marks the code review as closed. Caller must call `save` to commit the
  # change to the database.
  def close
    return unless closed_at.nil?
    self.closed_at = DateTime.now
  end

  def summarize
    {
      id: id,
      channelId: nil,             # TODO: implement this!
      version: project_version,
      isOpen: open?,
      createdAt: created_at,
    }.merge!(summarize_owner_info)
  end

  def summarize_with_comments
    summarize.merge!(
      {comments: comments.map(&:summarize)}
    )
  end

  def summarize_owner_info
    {
      ownerId: owner.id,
      ownerName: owner.name,
    }
  end
end
