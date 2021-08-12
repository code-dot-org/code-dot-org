# == Schema Information
#
# Table name: project_versions
#
#  id                :bigint           not null, primary key
#  storage_app_id    :integer          not null
#  object_version_id :string(255)      not null
#  comment           :text(16777215)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_project_versions_on_storage_app_id                        (storage_app_id)
#  index_project_versions_on_storage_app_id_and_object_version_id  (storage_app_id,object_version_id) UNIQUE
#
class ProjectVersion < ApplicationRecord
end
