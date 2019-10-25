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
    time_spent 10
    user_level_id 1
  end
end
