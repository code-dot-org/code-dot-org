# == Schema Information
#
# Table name: code_review_comments
#
#  id               :bigint           not null, primary key
#  storage_app_id   :integer          not null
#  project_version  :string(255)      not null
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

  # Note: this should be moved to the reviewable_projects model once it exists
  # Something like reviewable_project.user_can_review?(potential_reviewer)
  def self.user_can_review_project?(project_owner, potential_reviewer)
    project_owner == potential_reviewer ||
      project_owner.student_of?(potential_reviewer) ||
      (project_owner.sections_as_student & potential_reviewer.sections_as_student).any?
  end
end
