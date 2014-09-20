class Activity < ActiveRecord::Base
  # These values correspond to constants from /blockly/src/constants.js
  MINIMUM_FINISHED_RESULT = 10
  MINIMUM_PASS_RESULT = 20
  MAXIMUM_NONOPTIMAL_RESULT = 29
  FREE_PLAY_RESULT = 30
  BEST_PASS_RESULT = 100

  belongs_to :level
  belongs_to :user
  belongs_to :level_source
  has_one :activity_hint
  has_many :experiment_activities

  def Activity.best?(result)
    return false if result.nil?
    (result == BEST_PASS_RESULT)
  end

  def Activity.finished?(result)
    return false if result.nil?
    (result >= MINIMUM_FINISHED_RESULT)
  end

  def Activity.passing?(result)
    return false if result.nil?
    (result >= MINIMUM_PASS_RESULT)
  end

  def best?
    Activity.best? test_result
  end

  def finished?
    Activity.finished? test_result
  end

  def passing?
    Activity.passing? test_result
  end

end
