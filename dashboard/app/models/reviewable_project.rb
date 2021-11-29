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
    if DCDO.get('code_review_groups_enabled', false)
      return project_owner == user &&
        project_owner.sections_as_student.any?(&:code_review_enabled?) &&
        !project_owner.code_review_groups.empty?
    else
      return project_owner == user && project_owner.sections_as_student.all?(&:code_review_enabled?)
    end
  end

  def self.project_reviewable?(storage_app_id, user_id, level_id, script_id)
    reviewable_projects = ReviewableProject.where(storage_app_id: storage_app_id, user_id: user_id)
    if level_id
      reviewable_projects = reviewable_projects.where(level_id: level_id)
    end
    if script_id
      reviewable_projects = reviewable_projects.where(script_id: script_id)
    end
    reviewable_projects.any?
  end
end
