# == Schema Information
#
# Table name: user_project_storage_ids
#
#  id      :integer          not null, primary key
#  user_id :integer
#
# Indexes
#
#  user_id                         (user_id) UNIQUE
#  user_storage_ids_user_id_index  (user_id)
#
class ProjectStorage < ApplicationRecord
  # Conceptually, an instance of this class represents blob storage for all of
  # the projects belonging to a single user. The user may have an account (user_id
  # points to the user) or may be unsigned-in (user_id is nil). Under the covers,
  # metadata for this storage is stored in the 'user_project_storage_ids' table
  # and the blobs are stored in several S3 buckets depending on the blob type
  # (e.g. cdo-v3-sources/sources/<storage id>, cdo-v3-files/files/<storage id>, etc.).
  self.table_name = 'user_project_storage_ids'

  belongs_to :user, optional: true
  has_many :projects, inverse_of: :project_storage
end
