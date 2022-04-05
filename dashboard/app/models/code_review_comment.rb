# == Schema Information
#
# Table name: code_review_comments
#
#  id               :bigint           not null, primary key
#  storage_app_id   :integer          not null
#  project_version  :string(255)
#  script_id        :integer
#  level_id         :integer
#  commenter_id     :integer          not null
#  comment          :text(16777215)
#  project_owner_id :integer
#  section_id       :integer
#  is_from_teacher  :boolean
#  is_resolved      :boolean
#  deleted_at       :datetime
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_code_review_comments_on_storage_app_id_and_version  (storage_app_id,project_version)
#
class CodeReviewComment < ApplicationRecord
  acts_as_paranoid

  belongs_to :commenter, class_name: 'User'
  belongs_to :project_owner, class_name: 'User'

  validates :comment, presence: true
  validates :project_owner_id, presence: true

  before_save :compute_is_from_teacher

  # The projects table used to be named storage_apps. This column has not been renamed
  # to reflect the new table name, so an alias is used to clarify which table this ID maps to.
  alias_attribute :project_id, :storage_app_id

  def self.user_can_review_project?(project_owner, potential_reviewer, project_id, level_id = nil, script_id = nil)
    # user can always review own project
    return true if project_owner == potential_reviewer
    # teacher can always review student projects
    return true if project_owner.student_of?(potential_reviewer)
    # peers can only review projects where code review has been enabled, which creates a ReviewableProject
    return false unless ReviewableProject.project_reviewable?(project_id, project_owner.id, level_id, script_id)
    # peers can only review projects if they are in a section that together that have code review enabled
    return false if (project_owner.sections_as_student & potential_reviewer.sections_as_student).all? {|s| !s.code_review_enabled?}
    # finally, they must be in the same code review group
    return (project_owner.code_review_groups & potential_reviewer.code_review_groups).any?
  end

  def compute_is_from_teacher
    # Only should happen if we hard delete the commenter's account
    # via the delete accounts helper.
    return false if commenter.nil?

    self.is_from_teacher = commenter.teacher? ? true : false
  end
end
