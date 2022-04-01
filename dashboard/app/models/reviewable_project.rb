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

  # The projects table used to be named storage_apps. This column has not been renamed
  # to reflect the new table name, so an alias is used to clarify which table this ID maps to.
  alias_attribute :project_id, :storage_app_id

  def self.user_can_mark_project_reviewable?(project_owner, user)
    project_owner == user &&
      project_owner.sections_as_student.any?(&:code_review_enabled?) &&
      !project_owner.code_review_groups.empty?
  end

  def self.project_reviewable?(project_id, user_id, level_id, script_id)
    reviewable_projects = ReviewableProject.where(project_id: project_id, user_id: user_id)
    if level_id
      reviewable_projects = reviewable_projects.where(level_id: level_id)
    end
    if script_id
      reviewable_projects = reviewable_projects.where(script_id: script_id)
    end
    reviewable_projects.any?
  end
end
