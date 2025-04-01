# == Schema Information
#
# Table name: user_preferences
#
#  id            :bigint           not null, primary key
#  user_id       :integer          not null
#  section_order :json
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_user_preferences_on_user_id  (user_id)
#
class UserPreference < ApplicationRecord
end
