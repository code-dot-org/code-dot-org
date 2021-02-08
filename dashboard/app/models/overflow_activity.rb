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

# NOTE: The corresponding DB table (overflow_activities) was created on 2017-01-20 when the
# activities table overflowed the primary key. This model is meant to provide a (readonly) means to
# access the data therein. This model should not be expanded without significant discussion, also
# probably significant change, on the future of this data.
class OverflowActivity < ApplicationRecord
  belongs_to :level
  belongs_to :user
  belongs_to :level_source
end
