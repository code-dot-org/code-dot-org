# == Schema Information
#
# Table name: code_review_requests
#
#  id              :bigint           not null, primary key
#  user_id         :integer          not null
#  script_id       :integer          not null
#  level_id        :integer          not null
#  project_id      :integer          not null
#  project_version :string(255)      not null
#  closed_at       :datetime
#  deleted_at      :datetime
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_code_review_requests_unique  (user_id,script_id,level_id,closed_at,deleted_at) UNIQUE
class CodeReview < ApplicationRecord
  # TODO: Reorder columns so that the first three columns are id, user_id, project_id
  # TODO: Change unique index to include just user_id, project_id, closed_at, and deleted_at
  # TODO: Add index to look up by project_id
  # TODO: Add column to store channel id
  # TODO: Add column to store project version expiration

  # This model was renamed partway through the development process. This line
  # will be removed when the table is renamed before this work is completed.
  self.table_name = 'code_review_requests'

  acts_as_paranoid

  # TODO: Once all the renaming has settled, the following association should be:
  # has_many :comments, class_name: 'CodeReviewComment', dependent:  :destroy
  has_many :comments, class_name: 'CodeReviewNote', foreign_key: 'code_review_request_id', dependent:  :destroy

  # Enforce that each student can only have one open code review per script and
  # level. (This is also enforced at the database level with a unique index.)
  validates_uniqueness_of :user_id, scope: [:project_id],
    conditions: -> {where(closed_at: nil)},
    message: 'already has an open code review for this project'

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
      isVersionExpired: false,    # TODO: implement this!
      isOpen: open?,
      createdAt: created_at,
    }
  end

  def summarize_with_comments
    summarize.merge!(
      {comments: comments.map(&:summarize)}
    )
  end
end
