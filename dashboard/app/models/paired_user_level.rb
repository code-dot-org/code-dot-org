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

class PairedUserLevel < ActiveRecord::Base
  belongs_to :navigator_user_level, class_name: 'UserLevel'
  belongs_to :driver_user_level, class_name: 'UserLevel'
end
