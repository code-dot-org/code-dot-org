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
  include LevelsHelper
  include Rails.application.routes.url_helpers

  belongs_to :submitter, class_name: 'User'
  belongs_to :reviewer, class_name: 'User'
  belongs_to :script
  belongs_to :level
  belongs_to :level_source

  after_update :mark_user_level, if: proc {|review| review.status_changed? || review.data_changed?}

  SYSTEM_DELETED_DATA = ''.freeze

  before_save :add_assignment_to_audit_trail, if: :reviewer_id_changed?
  def add_assignment_to_audit_trail
    message = reviewer_id.present? ? "ASSIGNED to user id #{reviewer_id}" : 'UNASSIGNED'
    append_audit_trail message
  end

  before_save :add_status_to_audit_trail, if: -> {reviewer_id? && (status_changed? || data_changed?)}
  def add_status_to_audit_trail
    append_audit_trail "REVIEWED by user id #{reviewer_id} as #{status}"
  end

  after_save :send_review_completed_mail, if: -> {status_changed? && (accepted? || rejected?)}
  def send_review_completed_mail
    PeerReviewMailer.review_completed_receipt(self).deliver_now
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
        # There are no peer reviews that haven't been done. So instead, get a peer review
        # that was done for this script, clone it, and assign it to the user
        review_to_clone = get_potential_reviews(script, user).sample

        if review_to_clone
          new_review = review_to_clone.dup
          new_review.update(reviewer: user, status: nil, data: nil)
          new_review
        else
          # If we get here, it means that every review in the pool was either submitted by this user
          # or has been reviewed by this user. Return nothing
          nil
        end
      end
    end
  end

  def self.get_review_for_user(script, user)
    PeerReview.get_potential_reviews(script, user).where(
      status: nil,
      data: nil
    ).where(
      'reviewer_id is null or created_at < now() - interval 1 day'
    ).take
  end

  def mark_user_level
    user_level = UserLevel.find_by!(user: submitter, level: level)

    if from_instructor
      user_level.update!(best_result: accepted? ? Activity::REVIEW_ACCEPTED_RESULT : Activity::REVIEW_REJECTED_RESULT)
      update_column :audit_trail, append_audit_trail("#{status.upcase} by instructor #{reviewer_id} #{reviewer.name}")
    else
      update_column :audit_trail, append_audit_trail("REVIEWED by user id #{reviewer_id} #{reviewer.try(:name)}")
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

      peer_review = create!(
        submitter_id: user_level.user.id,
        from_instructor: false,
        script: user_level.script,
        level: user_level.level,
        level_source_id: level_source_id
      )

      peer_review.create_escalated_duplicate
    end
  end

  def self.get_review_completion_status(user, script)
    if user &&
        script.has_peer_reviews? &&
        Plc::EnrollmentUnitAssignment.exists?(user: user, plc_course_unit: script.plc_course_unit)
      # Completed peer reviews won't always have status set, but will either have status
      # or some content in the review
      reviews_done = PeerReview.where(reviewer: user, script: script).where('status IS NOT NULL or data IS NOT NULL').size

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
      status: review_completed? ? LEVEL_STATUS.perfect : LEVEL_STATUS.not_tried,
      name: review_completed? ? I18n.t('peer_review.link_to_submitted_review') : I18n.t('peer_review.review_in_progress'),
      result: review_completed? ? ActivityConstants::BEST_PASS_RESULT : ActivityConstants::UNSUBMITTED_RESULT,
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

  # Helper method for submission api calls
  def submission_summarize
    plc_course_unit = script.plc_course_unit

    {
      submitter: submitter.name,
      course_name: plc_course_unit.plc_course.name,
      unit_name: plc_course_unit.name,
      level_name: level.name,
      submission_date: created_at.strftime("%-m/%-d/%Y"),
      escalation_date: updated_at.strftime("%-m/%-d/%Y"),
      review_id: id
    }
  end

  # Helper method that summarizes things at the user_level level of granularity
  def self.get_submission_summary_for_user_level(user_level, script)
    reviews = PeerReview.where(submitter: user_level.user, level: user_level.level, script: script)
    if user_level.best_result == ActivityConstants::REVIEW_ACCEPTED_RESULT
      status = 'accepted'
    elsif user_level.best_result == ActivityConstants::REVIEW_REJECTED_RESULT
      status = 'rejected'
    elsif reviews.exists?(reviewer: nil, status: 'escalated')
      escalated_review = reviews.find_by(reviewer: nil, status: 'escalated')
      status = 'escalated'
    else
      status = 'open'
    end

    plc_course_unit = script.plc_course_unit

    {
      submitter: user_level.user.name,
      course_name: plc_course_unit.plc_course.name,
      unit_name: plc_course_unit.name,
      level_name: user_level.level.name,
      submission_date: reviews.any? && reviews.first.created_at.strftime("%-m/%-d/%Y"),
      escalated_review_id: status == 'escalated' ? escalated_review.id : nil,
      review_ids: reviews.pluck(:id, :status),
      status: status,
      accepted_reviews: reviews.accepted.count,
      rejected_reviews: reviews.rejected.count
    }
  end

  def related_reviews
    PeerReview.where(submitter: submitter, level: level).where.not(id: id)
  end

  # Returns the route path for the submission's script_level (or level if there is no script_level)
  # @returns [String] path to the submission (script_level or level)
  def submission_path
    script_level = level.script_levels.find_by(script: script)
    script_level ? build_script_level_path(script_level) : level_path(level)
  end

  # A review is done if there is either a marked status, or if there is any feedback in
  # the written section
  def review_completed?
    !status.nil? || !data.nil?
  end

  def create_escalated_duplicate
    PeerReview.find_or_create_by!(
      submitter: submitter,
      reviewer: nil,
      script: script,
      level: level,
      level_source_id: level_source_id,
      status: 2
    )
  end

  private

  def append_audit_trail(message)
    self.audit_trail = (audit_trail || '') + "#{message} at #{Time.zone.now}\n"
  end
end
