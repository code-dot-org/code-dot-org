# == Schema Information
#
# Table name: user_level_infos
#
#  id            :integer          not null, primary key
#  time_spent    :integer          default(0)
#  user_level_id :integer          unsigned
#

FactoryGirl.define do
  factory :user_level_info do
  end
end
