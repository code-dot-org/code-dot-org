# == Schema Information
#
# Table name: districts_users
#
#  user_id     :integer          not null
#  district_id :integer          not null
#
# Indexes
#
#  index_districts_users_on_district_id_and_user_id  (district_id,user_id)
#  index_districts_users_on_user_id_and_district_id  (user_id,district_id)
#

class DistrictsUsers < ActiveRecord::Base
  belongs_to :user
  belongs_to :district
end
