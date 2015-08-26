# == Schema Information
#
# Table name: gallery_activities
#
#  id          :integer          not null, primary key
#  user_id     :integer          not null
#  activity_id :integer          not null
#  created_at  :datetime
#  updated_at  :datetime
#  autosaved   :boolean
#  app         :string(255)      default("turtle"), not null
#
# Indexes
#
#  index_gallery_activities_on_app_and_autosaved        (app,autosaved)
#  index_gallery_activities_on_user_id_and_activity_id  (user_id,activity_id) UNIQUE
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :gallery_activity do
    user
    activity
  end
end
