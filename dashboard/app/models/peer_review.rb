# == Schema Information
#
# Table name: peer_reviews
#
#  id              :integer          not null, primary key
#  submitter_id    :integer
#  reviewer_id     :integer
#  from_instructor :boolean          default(FALSE), not null
#  script_id       :integer          not null
#  level_id        :integer          not null
#  level_source_id :integer          not null
#  data            :text(65535)
#  status          :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_peer_reviews_on_level_id         (level_id)
#  index_peer_reviews_on_level_source_id  (level_source_id)
#  index_peer_reviews_on_reviewer_id      (reviewer_id)
#  index_peer_reviews_on_script_id        (script_id)
#  index_peer_reviews_on_submitter_id     (submitter_id)
#

class PeerReview < ActiveRecord::Base
  belongs_to :submitter, class_name: 'User'
  belongs_to :reviewer, class_name: 'User'
  belongs_to :script
  belongs_to :level
  belongs_to :level_source

  after_save :mark_user_level

  REVIEWS_PER_SUBMISSION = 2
  REVIEWS_FOR_CONSENSUS = 2

  enum status: {
    accepted: 0,
    rejected: 1,
    escalated: 2
  }

  def mark_user_level
    user_level = UserLevel.find_by!(user: submitter, level: level)

    # Instructor feedback should override all other feedback
    if from_instructor
      user_level.update!(best_result: accepted? ? Activity::REVIEW_ACCEPTED_RESULT : Activity::REVIEW_REJECTED_RESULT)
      return
    end

    # Ignore negative peer feedback after a submission has already been approved
    return if user_level.best_result == Activity::REVIEW_ACCEPTED_RESULT

    # Only look at reviews for the most recent submission
    most_recent = submitter.last_attempt(level).try(:level_source_id)
    return unless level_source_id == most_recent

    # Find all current PeerReviews for this submission
    reviews = PeerReview.where(
      submitter: submitter,
      script: script,
      level: level,
      level_source_id: most_recent
    ).where.not(status: nil)

    # Need at least `REVIEWS_FOR_CONSENSUS` reviews to accept/reject
    return unless reviews.size >= REVIEWS_FOR_CONSENSUS

    # TODO: Add an else clause with find_or_create PeerReview assigned to the
    # instructor.
    if reviews.all?(&:accepted?)
      user_level.update!(best_result: Activity::REVIEW_ACCEPTED_RESULT)
    elsif reviews.all?(&:rejected?)
      user_level.update!(best_result: Activity::REVIEW_REJECTED_RESULT)
    end
  end

  def localized_status
    I18n.t("peer_review.#{status}.name") if status
  end

  def localized_status_description
    I18n.t("peer_review.#{status}.description").html_safe if status
  end

  def self.create_for_submission(user_level, level_source_id)
    transaction do
      # Remove old unassigned reviews for this submitter+script+level combination
      where(
        reviewer_id: nil,
        submitter_id: user_level.user.id,
        from_instructor: false,
        script: user_level.script,
        level: user_level.level,
      ).destroy_all

      REVIEWS_PER_SUBMISSION.times do
        create!(
          submitter_id: user_level.user.id,
          from_instructor: false,
          script: user_level.script,
          level: user_level.level,
          level_source_id: level_source_id
        )
      end
    end
  end
end
