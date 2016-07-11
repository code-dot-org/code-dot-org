# == Schema Information
#
# Table name: user_levels
#
#  id              :integer          not null, primary key
#  user_id         :integer          not null
#  level_id        :integer          not null
#  attempts        :integer          default(0), not null
#  created_at      :datetime
#  updated_at      :datetime
#  best_result     :integer
#  script_id       :integer
#  level_source_id :integer
#  submitted       :boolean
#
# Indexes
#
#  index_user_levels_on_user_id_and_level_id_and_script_id  (user_id,level_id,script_id) UNIQUE
#

require 'cdo/activity_constants'

# Summary information about a User's Activity on a Level in a Script.
# Includes number of attempts (attempts), best score and whether it was submitted
class UserLevel < ActiveRecord::Base
  belongs_to :user
  belongs_to :level
  belongs_to :script
  belongs_to :level_source

  before_save :handle_unsubmit

  # TODO(asher): Consider making these scopes and the methods below more consistent, in tense and in
  # word choice.
  scope :attempted, -> { where.not(best_result: nil) }
  scope :passing, -> { where('best_result >= ?', ActivityConstants::MINIMUM_PASS_RESULT) }
  scope :perfect, -> { where('best_result > ?', ActivityConstants::MAXIMUM_NONOPTIMAL_RESULT) }

  def best?
    Activity.best? best_result
  end

  def perfect?
    Activity.perfect? best_result
  end

  def finished?
    Activity.finished? best_result
  end

  def passing?
    Activity.passing? best_result
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
    most_recent ? most_recent.user.name : nil
  end

  def paired?
    driver? || navigator?
  end

  def handle_unsubmit
    if submitted_changed? from: true, to: false
      self.best_result = ActivityConstants::UNSUBMITTED_RESULT
    end
  end
end
