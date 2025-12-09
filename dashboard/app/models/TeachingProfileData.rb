# == Schema Information
#
# Table name: teaching_profile_data
#
#  id              :bigint           not null, primary key
#  user_id         :integer          not null
#  individual_data :json
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_teaching_profile_data_on_user_id  (user_id)
#
class TeachingProfileData < ApplicationRecord
  belongs_to :user
end
