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
  belongs_to :user, optional: true
  belongs_to :level, optional: true
  belongs_to :script, optional: true

  # The projects table used to be named storage_apps. This column has not been renamed
  # to reflect the new table name, so an alias is used to clarify which table this ID maps to.
  alias_attribute :project_id, :storage_app_id
end
