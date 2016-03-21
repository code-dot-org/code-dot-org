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

  # TODO(asher): Consider making these scopes and the methods below more consistent, in tense and in
  # word choice.
  scope :attempted, -> { where.not(best_result: nil) }
  scope :passing, -> { where('best_result >= ?', ActivityConstants::MINIMUM_PASS_RESULT) }
  scope :perfect, -> { where('best_result > ?', ActivityConstants::MAXIMUM_NONOPTIMAL_RESULT) }

  def best?
    Activity.best? best_result
  end

  def finished?
    Activity.finished? best_result
  end

  def passing?
    Activity.passing? best_result
  end
end
