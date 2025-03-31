# == Schema Information
#
# Table name: user_preferences
#
#  id            :bigint           not null, primary key
#  user_id       :integer          not null
#  section_order :string(255)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_user_preferences_on_user_id  (user_id)
#
FactoryBot.define do
  factory :user_preference do
  end
end
