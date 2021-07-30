# == Schema Information
#
# Table name: reviewable_projects
#
#  id             :bigint           not null, primary key
#  storage_app_id :integer          not null
#  user_id        :integer          not null
#  level_id       :integer
#  script_id      :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_reviewable_projects_on_user_script_level_storage_app  (user_id,script_id,level_id,storage_app_id)
#
class ReviewableProject < ApplicationRecord
  belongs_to :user
  belongs_to :level
  belongs_to :script

  def self.user_can_mark_project_reviewable?(project_owner, user)
    project_owner == user
  end
end
