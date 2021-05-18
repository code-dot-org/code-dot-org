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
#
# Indexes
#
#  index_user_levels_on_user_id_and_level_id_and_script_id  (user_id,level_id,script_id) UNIQUE
#

require 'cdo/activity_constants'

# Summary information about a User's Activity on a Level in a Script.
# Includes number of attempts (attempts), best score and whether it was submitted
class UserLevel < ApplicationRecord
  AUTOLOCK_PERIOD = 1.day

  belongs_to :user
  belongs_to :level
  belongs_to :script
  belongs_to :level_source

  after_save :after_submit, if: :submitted_or_resubmitted?
  before_save :before_unsubmit, if: ->(ul) {ul.submitted_changed? from: true, to: false}

  # TODO(asher): Consider making these scopes and the methods below more consistent, in tense and in
  # word choice.
  scope :attempted, -> {where.not(best_result: nil)}
  scope :passing, -> {where('best_result >= ?', ActivityConstants::MINIMUM_PASS_RESULT)}
  scope :perfect, -> {where('best_result > ?', ActivityConstants::MAXIMUM_NONOPTIMAL_RESULT)}

  def self.by_stage(lesson)
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

  # user levels can be linked through pair programming. The 'driver'
  # user level is the one that is linked to the user account that
  # completed the activity; the 'navigator' user level is the one that
  # also gets credit for the solution.
  has_many :paired_user_levels_as_navigator, class_name: 'PairedUserLevel', foreign_key: 'navigator_user_level_id'
  has_many :paired_user_levels_as_driver, class_name: 'PairedUserLevel', foreign_key: 'driver_user_level_id'

  has_many :navigator_user_levels, through: :paired_user_levels_as_driver
  has_many :driver_user_levels, through: :paired_user_levels_as_navigator

  def driver?
    navigator_user_levels.present?
  end

  def navigator?
    driver_user_levels.present?
  end

  def self.most_recent_driver(script, level, user)
    most_recent = find_by(script: script, level: level, user: user).try(:driver_user_levels).try(:last)
    return nil unless most_recent

    most_recent_user = most_recent.user || DeletedUser.instance
    return most_recent_user.name, most_recent.level_source_id, most_recent_user
  end

  def self.most_recent_navigator(script, level, user)
    most_recent = find_by(script: script, level: level, user: user).try(:navigator_user_levels).try(:last)
    return nil unless most_recent

    most_recent_user = most_recent.user || DeletedUser.instance
    return most_recent_user.name, most_recent.level_source_id, most_recent_user
  end

  def paired?
    driver? || navigator?
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
    if Script.cache_find_level(level_id).try(:peer_reviewable?)
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

  # First ScriptLevel in this Script containing this Level.
  # Cached equivalent to `level.script_levels.where(script_id: script.id).first`.
  def script_level
    s = Script.get_from_cache(script_id)
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

  # Get number of passed levels per user for the given set of user IDs
  # @param [ActiveRecord::Relation<Collection<User>>] users
  # @return [Hash<Integer, Integer>] user_id => passed_level_count
  def self.count_passed_levels_for_users(users)
    joins(:user).merge(users).passing.group(:user_id).count
  end

  # Making unlocked_at private ensures future updates will use the locked
  # virtual attribute directly, avoiding the need to recalculate a value
  # for locked based on the 'unlocked_at' field in the db.
  private

  def unlocked_at
    self[:unlocked_at]
  end

  def unlocked_at=(val)
    write_attribute :unlocked_at, val
  end
end
