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

  belongs_to :commenter, class_name: 'User', optional: true
  belongs_to :project_owner, class_name: 'User'

  validates :comment, presence: true

  # The projects table used to be named storage_apps. This column has not been renamed
  # to reflect the new table name, so an alias is used to clarify which table this ID maps to.
  alias_attribute :project_id, :storage_app_id
end
