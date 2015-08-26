# == Schema Information
#
# Table name: activities
#
#  id              :integer          not null, primary key
#  user_id         :integer
#  level_id        :integer
#  action          :string(255)
#  url             :string(255)
#  created_at      :datetime
#  updated_at      :datetime
#  attempt         :integer
#  time            :integer
#  test_result     :integer
#  level_source_id :integer
#  lines           :integer          default(0), not null
#
# Indexes
#
#  index_activities_on_level_source_id       (level_source_id)
#  index_activities_on_user_id_and_level_id  (user_id,level_id)
#

require 'cdo/activity_constants'

class Activity < ActiveRecord::Base
  include ActivityConstants

  belongs_to :level
  belongs_to :user
  belongs_to :level_source
  has_one :activity_hint
  has_many :experiment_activities

  def Activity.best?(result)
    return false if result.nil?
    (result == BEST_PASS_RESULT)
  end

  def Activity.passing?(result)
    return false if result.nil?
    (result >= MINIMUM_PASS_RESULT)
  end

  def Activity.finished?(result)
    return false if result.nil?
    (result >= MINIMUM_FINISHED_RESULT)
  end

  def best?
    Activity.best? test_result
  end

  def passing?
    Activity.passing? test_result
  end

  def finished?
    Activity.finished? test_result
  end

  def Activity.recent(limit)
    # yeah, this is a lot like .last -- but I want a dataset not an array
    Activity.order('id desc').limit(limit)
  end
end
