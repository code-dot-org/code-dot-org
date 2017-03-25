# == Schema Information
#
# Table name: user_levels
#
#  id               :integer          not null, primary key
#  user_id          :integer          not null
#  level_id         :integer          not null
#  attempts         :integer          default(0), not null
#  created_at       :datetime
#  updated_at       :datetime
#  best_result      :integer
#  script_id        :integer
#  level_source_id  :integer
#  submitted        :boolean
#  readonly_answers :boolean
#  unlocked_at      :datetime
#
# Indexes
#
#  index_user_levels_on_user_id_and_level_id_and_script_id  (user_id,level_id,script_id) UNIQUE
#

require 'cdo/activity_constants'

# Summary information about a User's Activity on a Level in a Script.
# Includes number of attempts (attempts), best score and whether it was submitted
class UserLevel < ActiveRecord::Base
  AUTOLOCK_PERIOD = 1.day

  belongs_to :user
  belongs_to :level
  belongs_to :script
  belongs_to :level_source

  before_save :handle_unsubmit

  validate :readonly_requires_submitted

  # TODO(asher): Consider making these scopes and the methods below more consistent, in tense and in
  # word choice.
  scope :attempted, -> {where.not(best_result: nil)}
  scope :passing, -> {where('best_result >= ?', ActivityConstants::MINIMUM_PASS_RESULT)}
  scope :perfect, -> {where('best_result > ?', ActivityConstants::MAXIMUM_NONOPTIMAL_RESULT)}

  def readonly_requires_submitted
    if readonly_answers? && !submitted?
      errors.add(:readonly_answers, 'readonly_answers only valid on submitted UserLevel')
    end
  end

  def best?
    ActivityConstants.best?(best_result)
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

    most_recent_user = most_recent.user
    return I18n.t('user.deleted_user') unless most_recent_user

    return most_recent_user.name
  end

  def paired?
    driver? || navigator?
  end

  def handle_unsubmit
    if submitted_changed? from: true, to: false
      self.best_result = ActivityConstants::UNSUBMITTED_RESULT
    end
  end

  def has_autolocked?(stage)
    return false unless stage.lockable?
    unlocked_at && unlocked_at < AUTOLOCK_PERIOD.ago
  end

  def locked?(stage)
    return false unless stage.lockable?
    return false if user.authorized_teacher?
    submitted? && !readonly_answers? || has_autolocked?(stage)
  end

  def self.update_lockable_state(user_id, level_id, script_id, locked, readonly_answers)
    user_level = UserLevel.find_or_initialize_by(
      user_id: user_id,
      level_id: level_id,
      script_id: script_id
    )

    # no need to create a level if it's just going to be locked
    return if !user_level.persisted? && locked

    user_level.update!(
      submitted: locked || readonly_answers,
      readonly_answers: !locked && readonly_answers,
      unlocked_at: locked ? nil : Time.now,
      # level_group, which is the only levels that we lock, always sets best_result to 100 when complete
      best_result: (locked || readonly_answers) ? ActivityConstants::BEST_PASS_RESULT : user_level.best_result
    )
  end
end
