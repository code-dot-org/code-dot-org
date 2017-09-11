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
#  audit_trail     :text(65535)
#
# Indexes
#
#  index_peer_reviews_on_level_id         (level_id)
#  index_peer_reviews_on_level_source_id  (level_source_id)
#  index_peer_reviews_on_reviewer_id      (reviewer_id)
#  index_peer_reviews_on_script_id        (script_id)
#  index_peer_reviews_on_submitter_id     (submitter_id)
#

require 'cdo/shared_constants'

class PeerReview < ActiveRecord::Base
  include SharedConstants

  belongs_to :submitter, class_name: 'User'
  belongs_to :reviewer, class_name: 'User'
  belongs_to :script
  belongs_to :level
  belongs_to :level_source

  after_update :mark_user_level, if: :status_changed?

  REVIEWS_PER_SUBMISSION = 2
  REVIEWS_FOR_CONSENSUS = 2
  SYSTEM_DELETED_DATA = ''.freeze

  before_save :add_assignment_to_audit_trail, if: :reviewer_id_changed?
  def add_assignment_to_audit_trail
    message = reviewer_id.present? ? "ASSIGNED to user id #{reviewer_id}" : 'UNASSIGNED'
    append_audit_trail message
  end

  before_save :add_status_to_audit_trail, if: :status_changed?
  def add_status_to_audit_trail
    append_audit_trail "REVIEWED by user id #{reviewer_id} as #{status}"
  end

  enum status: {
    accepted: 0,
    rejected: 1,
    escalated: 2
  }

  def user_level
    UserLevel.find_by!(user: submitter, level: level)
  end

  def self.pull_review_from_pool(script, user)
    # Find the first review such that meets these criteria
    # Review is for this script
    # I am not the submitter X
    # Review status is nil
    # Reviewer is nil or it has been assigned for more than a day
    # Reviewer is not currently reviewing this level source
    transaction do
      peer_review = get_review_for_user(script, user)

      if peer_review
        peer_review.update!(reviewer: user)
        peer_review
      else
        review_to_clone = get_potential_reviews(script, user).sample

        if review_to_clone
          new_review = review_to_clone.dup
          new_review.update(reviewer: user, status: nil, data: nil)
          new_review
        else
          # If we get here, it means that every review in the pool was either submitted by this user
          # or has been reviewed by this user. Oh well, return nothing.
          nil
        end
      end
    end
  end

  def self.get_review_for_user(script, user)
    PeerReview.get_potential_reviews(script, user).where(
      status: nil
    ).where(
      'reviewer_id is null or created_at < now() - interval 1 day'
    ).take
  end

  def mark_user_level
    user_level = UserLevel.find_by!(user: submitter, level: level)

    # Instructor feedback should override all other feedback
    if from_instructor
      user_level.update!(best_result: accepted? ? Activity::REVIEW_ACCEPTED_RESULT : Activity::REVIEW_REJECTED_RESULT)
      update_column :audit_trail, append_audit_trail("#{status.upcase} by instructor #{reviewer_id} #{reviewer.name}")

      # There's no need for the outstanding peer reviews to stick around because the instructor has reviewed them. So
      # they are safe to delete.
      PeerReview.where(submitter: submitter, reviewer: nil, status: nil, level: level).destroy_all
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

    if reviews.all?(&:accepted?)
      user_level.update!(best_result: Activity::REVIEW_ACCEPTED_RESULT)
      update_column :audit_trail, append_audit_trail("ACCEPTED by user id #{reviewer_id}")
    elsif reviews.all?(&:rejected?)
      user_level.update!(best_result: Activity::REVIEW_REJECTED_RESULT)
      update_column :audit_trail, append_audit_trail("REJECTED by user id #{reviewer_id}")
    else
      # No consensus: escalate the review (i.e. create an escalated review based on this one)
      escalated_review = dup
      escalated_review.assign_attributes(status: 'escalated', reviewer: nil)
      escalated_review.save!
      update_column :audit_trail, append_audit_trail("NO CONSENSUS after review by user id #{reviewer_id}")
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

  def self.get_review_completion_status(user, script)
    if user &&
        script.has_peer_reviews? &&
        Plc::EnrollmentUnitAssignment.exists?(user: user, plc_course_unit: script.plc_course_unit)
      reviews_done = PeerReview.where(reviewer: user, script: script, status: PeerReview.statuses.values).size

      if reviews_done >= script.peer_reviews_to_complete
        Plc::EnrollmentModuleAssignment::COMPLETED
      elsif reviews_done > 0
        Plc::EnrollmentModuleAssignment::IN_PROGRESS
      else
        Plc::EnrollmentModuleAssignment::NOT_STARTED
      end
    end
  end

  def self.get_peer_review_summaries(user, script)
    if user &&
        script.has_peer_reviews? &&
        Plc::EnrollmentUnitAssignment.exists?(user: user, plc_course_unit: script.plc_course_unit)

      PeerReview.where(reviewer: user, script: script).map(&:summarize).tap do |reviews|
        if script.peer_reviews_to_complete &&
            reviews.size < script.peer_reviews_to_complete &&
            PeerReview.get_potential_reviews(script, user).any?
          reviews << {
            status: LEVEL_STATUS.not_tried,
            name: I18n.t('peer_review.review_new_submission'),
            result: ActivityConstants::UNSUBMITTED_RESULT,
            icon: '',
            locked: false
          }
        end
      end
    end
  end

  def summarize
    return {
      id: id,
      status: status.nil? ? LEVEL_STATUS.not_tried : LEVEL_STATUS.perfect,
      name: status.nil? ? I18n.t('peer_review.review_in_progress') : I18n.t('peer_review.link_to_submitted_review'),
      result: status.nil? ? ActivityConstants::UNSUBMITTED_RESULT : ActivityConstants::BEST_PASS_RESULT,
      locked: false
    }
  end

  def self.get_potential_reviews(script, user)
    where(
      script: script,
    ).where.not(
      submitter: user,
      level_source_id: PeerReview.where(reviewer: user, script: script).pluck(:level_source_id)
    )
  end

  def clear_data
    update(data: SYSTEM_DELETED_DATA)
  end

  private

  def append_audit_trail(message)
    self.audit_trail = (audit_trail || '') + "#{message} at #{Time.zone.now}\n"
  end
end
