# == Schema Information
#
# Table name: project_version_metadata
#
#  id                :bigint           not null, primary key
#  storage_app_id    :string(255)      not null
#  object_version_id :string(255)      not null
#  comment           :text(16777215)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_project_version_metadata_on_storage_app_id  (storage_app_id)
#
class ProjectVersionMetadatum < ApplicationRecord
end
