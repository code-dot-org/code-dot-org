# == Schema Information
#
# Table name: paired_user_levels
#
#  id                      :integer          not null, primary key
#  driver_user_level_id    :integer
#  navigator_user_level_id :integer
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#
# Indexes
#
#  index_paired_user_levels_on_driver_user_level_id     (driver_user_level_id)
#  index_paired_user_levels_on_navigator_user_level_id  (navigator_user_level_id)
#

class PairedUserLevel < ActiveRecord::Base
  belongs_to :navigator_user_level, class_name: 'UserLevel'
  belongs_to :driver_user_level, class_name: 'UserLevel'

  # @param user_level_ids (Array) an array of user_level_ids.
  # @return (Array) a subarray of user_level_ids containing those IDs associated
  #   with pair programming (as driver or navigator)
  def self.pairs(user_level_ids)
    drivers = PairedUserLevel.
      where(driver_user_level_id: user_level_ids).
      pluck(:driver_user_level_id)
    navigators = PairedUserLevel.
      where(navigator_user_level_id: user_level_ids).
      pluck(:navigator_user_level_id)
    return drivers | navigators
  end
end
