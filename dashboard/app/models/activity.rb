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

class Activity < ApplicationRecord
  include ActivityConstants

  belongs_to :level
  belongs_to :user
  belongs_to :level_source

  def perfect?
    ActivityConstants.perfect? test_result
  end

  def passing?
    ActivityConstants.passing? test_result
  end

  def finished?
    ActivityConstants.finished? test_result
  end
end
