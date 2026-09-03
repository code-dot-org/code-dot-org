# == Schema Information
#
# Table name: user_project_storage_ids
#
#  id           :integer          not null, primary key
#  user_id      :integer
#  anon_user_id :string(36)
#
# Indexes
#
#  user_id                         (user_id) UNIQUE
#  user_storage_ids_user_id_index  (user_id)
#
class ProjectStorage < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :confidential,
    user_id: :confidential,
    anon_user_id: :confidential,
  )

  # Conceptually, an instance of this class represents blob storage for all of
  # the projects belonging to a single user. The user may have an account (user_id
  # points to the user) or may be unsigned-in (user_id is nil). Under the covers,
  # metadata for this storage is stored in the 'user_project_storage_ids' table
  # and the blobs are stored in several S3 buckets depending on the blob type
  # (e.g. cdo-v3-sources/sources/<storage id>, cdo-v3-files/files/<storage id>, etc.).
  self.table_name = 'user_project_storage_ids'

  belongs_to :user, optional: true
  has_many :projects, foreign_key: :storage_id, inverse_of: :project_storage
  has_one :geo,
          class_name: 'ProjectStorage::Geo',
          foreign_key: :storage_id,
          inverse_of: :project_storage,
          dependent: :destroy

  scope :anonymous, -> {where(user_id: nil)}
  scope :without_geo, -> {where.missing(:geo)}
  scope :with_projects, -> {where(Project.where(Project.arel_table[:storage_id].eq(arel_table[:id])).arel.exists)}
end
