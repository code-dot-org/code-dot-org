# == Schema Information
#
# Table name: overflow_activities
#
#  id :integer
#

# NOTE: The corresponding DB table (overflow_activities) was created on 2017-01-20 when the
# activities table overflowed the primary key. This model is meant to provide a (readonly) means to
# access the data therein. This model should not be expanded without significant discussion, also
# probably significant change, on the future of this data.
class OverflowActivity < ActiveRecord::Base
  belongs_to :level
  belongs_to :user
  belongs_to :level_source
end
