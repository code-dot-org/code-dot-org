# == Schema Information
#
# Table name: user_levels
#
#  id               :bigint           unsigned, not null, primary key
#  user_id          :integer          not null
#  level_id         :integer          not null
#  attempts         :integer          default(0), not null
#  created_at       :datetime
#  updated_at       :datetime
#  best_result      :integer
#  script_id        :integer
#  level_source_id  :bigint           unsigned
#  submitted        :boolean
#  readonly_answers :boolean
#  unlocked_at      :datetime
#  time_spent       :integer
#  deleted_at       :datetime
#  properties       :text(65535)
#
# Indexes
#
#  index_user_levels_unique  (user_id,script_id,level_id,deleted_at) UNIQUE
#

require 'cdo/activity_constants'

# Summary information about a User's Activity on a Level in a Unit.
# Includes number of attempts (attempts), best score and whether it was submitted
class UserLevel < ApplicationRecord
  AUTOLOCK_PERIOD = 1.day

  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  belongs_to :user, optional: true
  belongs_to :level, optional: true
  belongs_to :script, class_name: 'Unit', optional: true
  belongs_to :level_source, optional: true

  after_save :after_submit, if: :submitted_or_resubmitted?
  before_save :before_unsubmit, if: ->(ul) {ul.submitted_changed? from: true, to: false}

  # TODO(asher): Consider making these scopes and the methods below more consistent, in tense and in
  # word choice.
  scope :attempted, -> {where.not(best_result: nil)}
  scope :passing, -> {where('best_result >= ?', ActivityConstants::MINIMUM_PASS_RESULT)}
  scope :perfect, -> {where('best_result > ?', ActivityConstants::MAXIMUM_NONOPTIMAL_RESULT)}

  def self.by_lesson(lesson)
    levels = lesson.script_levels.map(&:level_ids).flatten
    where(script: lesson.script, level: levels)
  end

  def attempted?
    !best_result.nil?
  end

  def perfect?
    ActivityConstants.perfect?(best_result)
  end

  def finished?
    ActivityConstants.finished?(best_result)
  end

  def passing?
    ActivityConstants.passing?(best_result)
  end

  # Returns whether this UserLevel represents progress completed by a pairing
  # group where the user was the driver.
  def driver?
    return false if latest_paired_user_level.nil?
    id == latest_paired_user_level.driver_user_level_id
  end

  # Returns whether this UserLevel represents progress completed by a pairing
  # group where the user was a navigator.
  def navigator?
    return false if latest_paired_user_level.nil?
    id == latest_paired_user_level.navigator_user_level_id
  end

  # Returns whether this UserLevel represents progress completed by a pairing
  # group.
  def paired?
    driver? || navigator?
  end

  # Returns the User object representing the driver of the pairing group if this
  # UserLevel represents progress completed by a pairing group and the driver
  # information is available.  It is possible for navigator? to return true but
  # driver to return nil if the driver or the driver's progress was deleted.
  def driver
    latest_paired_user_level&.driver
  end

  # Returns the driver's level_source id if this UserLevel represents progress
  # completed when in a pairing group. For non-channel-backed levels, this is
  # where the source written by the pairing group is stored.
  def driver_level_source_id
    latest_paired_user_level&.driver_level_source_id
  end

  # Returns the names of the partners (i.e. other students) in the pairing group
  # if this UserLevel represents progress completed when in a pairing group.
  # Partners whose user account or progress was deleted are omitted from the
  # returned list.
  def partner_names
    return nil unless latest_paired_user_level

    if navigator?
      driver = latest_paired_user_level.driver&.name
      other_navigators = latest_paired_user_level.navigators_names(exclude_self: true)
      return driver ?
        [driver] + other_navigators :
        other_navigators
    else
      return latest_paired_user_level.navigators_names(exclude_self: false)
    end
  end

  # Returns the number of partners in the pairing group if this UserLevel
  # represents progress completed when in a pairing group.
  def partner_count
    # Regardless of whether this user level represents the driver or the
    # navigator, the total number of people in the pairing group is
    # (latest_paired_user_level.navigator_count + 1) and the number of partners
    # is latest_paired_user_level.navigator_count.
    latest_paired_user_level&.navigator_count
  end

  def calculate_total_time_spent(additional_time)
    existing_time_spent = time_spent ? time_spent : 0
    additional_time && additional_time > 0 ? existing_time_spent + additional_time : existing_time_spent
  end

  def submitted_or_resubmitted?
    saved_change_to_submitted?(to: true) || (submitted? && saved_change_to_level_source_id?)
  end

  def after_submit
    submitted_level = Level.cache_find(level_id)

    # Some levels that belong to the professional learning program are peer reviewable.
    # When submitting such a level, we create a record for a pending peer review, so that
    # it becomes available for another teacher in the program to review.
    if submitted_level.try(:peer_reviewable?)
      PeerReview.create_for_submission(self, level_source_id)
    end
  end

  def before_unsubmit
    self.best_result = ActivityConstants::UNSUBMITTED_RESULT

    # Destroy any existing, unassigned peer reviews
    if Unit.cache_find_level(level_id).try(:peer_reviewable?)
      PeerReview.where(submitter: user.id, reviewer: nil, level: level).destroy_all
    end
  end

  # `locked` is a virtual attribute because it relies on `unlocked_at` to
  # automatically return `true` after `AUTOLOCK_PERIOD`, so the following
  # are its getter and setter
  def locked
    unlocked_at.nil? || unlocked_at < AUTOLOCK_PERIOD.ago
  end

  def locked=(is_locked)
    self.unlocked_at = is_locked ? nil : Time.now
  end

  # this is the "locked" value we return to the client.
  # if the lesson isn't lockable, we always return `false`.
  def show_as_locked?(lesson)
    return false unless lesson.lockable?
    locked
  end

  # `readonly` and `locked` are mutually exclusive on the client, so we use
  # this helper to override the value of `readonly_answers` when we're supposed
  # to show as locked.
  def show_as_readonly?(lesson)
    readonly_answers? && !show_as_locked?(lesson)
  end

  # First ScriptLevel in this Unit containing this Level.
  # Cached equivalent to `level.script_levels.where(script_id: script.id).first`.
  def script_level
    s = Unit.get_from_cache(script_id)
    s.script_levels.detect {|sl| sl.level_ids.include? level_id}
  end

  # This is called when a teacher updates the lock or readonly status for each student.
  # As such, one of locked or readonly will be populated, and the other nil.
  def self.update_lockable_state(user_id, level_id, script_id, locked, readonly_answers)
    user_level = UserLevel.find_or_initialize_by(
      user_id: user_id,
      level_id: level_id,
      script_id: script_id
    )

    # no need to create a level if it's just going to be locked
    return if !user_level.persisted? && locked

    # Explicitly set `locked=false` if `readonly_answers=true` to start
    # the autolock clock so that the mutually-exclusive `show_as_locked` and
    # `show_as_readonly` will flip from `false/true` to `true/false`
    # after AUTOLOCK_PERIOD has passed.
    # Otherwise, update according to new status given
    user_level.locked = readonly_answers ? false : locked
    user_level.readonly_answers = readonly_answers

    # preserve updated_at, which represents the user's submission timestamp.
    user_level.save!(touch: false)
  end

  def self.update_best_result(user_id, level_id, script_id, best_result, touch_updated_at: true)
    user_level = UserLevel.find_by(
      level_id: level_id,
      script_id: script_id,
      user_id: user_id
    )

    if user_level.present?
      user_level.best_result = best_result

      # touch_updated_at=false preserves updated_at, which represents the user's submission timestamp.
      user_level.save!(touch: touch_updated_at)
    end
  end

  # Get number of passed levels per user for the given set of user IDs
  # @param [ActiveRecord::Relation<Collection<User>>] users
  # @return [Hash<Integer, Integer>] user_id => passed_level_count
  def self.count_passed_levels_for_users(users)
    joins(:user).merge(users).passing.group(:user_id).count
  end

  # Retrieves and memoizes the latest PairedUserLevel that's associated with
  # this UserLevel for internal callers. External callers should call one of
  # the higher-level pairing-related methods below.
  #
  # Conceptually, each UserLevel should only be associated with one
  # PairedUserLevel. However, since we don't clean up previous entries in the
  # paired_user_levels table when posting progress, there can be multiple
  # entries in the paired_user_levels table associated with a user_level. We
  # heuristically consider the latest entry in the paired_user_levels table as
  # the "active" one. This is correct for most cases but can be incorrect in
  # some edge cases such as when a student leaves a pairing group and makes
  # further progress on a level as an individual.
  private def latest_paired_user_level
    return @latest_paired_user_level if defined? @latest_paired_user_level
    @latest_paired_user_level =
      PairedUserLevel.where(driver_user_level_id: id).
        or(PairedUserLevel.where(navigator_user_level_id: id)).
        last
  end

  # Making unlocked_at private ensures future updates will use the locked
  # virtual attribute directly, avoiding the need to recalculate a value
  # for locked based on the 'unlocked_at' field in the db.
  private def unlocked_at
    self[:unlocked_at]
  end

  private def unlocked_at=(val)
    write_attribute :unlocked_at, val
  end
end
