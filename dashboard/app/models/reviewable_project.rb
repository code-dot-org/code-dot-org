# == Schema Information
#
# Table name: reviewable_projects
#
#  id             :bigint           not null, primary key
#  storage_app_id :integer          not null
#  user_id        :integer          not null
#  level_id       :integer          not null
#  script_id      :integer          not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_reviewable_projects_on_storage_app_id_and_user_id  (storage_app_id,user_id)
#
class ReviewableProject < ApplicationRecord
  acts_as_paranoid
end
