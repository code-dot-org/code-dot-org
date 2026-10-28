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

  # Replaces storage_id_for_user_id. Like it, a nil user_id matches an arbitrary anonymous storage.
  def self.storage_id_for_user_id(user_id)
    where(user_id: user_id).pick(:id)
  end

  # Replaces user_id_for_storage_id.
  def self.user_id_for_storage_id(storage_id)
    where(id: storage_id).pick(:user_id)
  end

  # Replaces get_storage_ids_by_user_ids.
  def self.storage_ids_by_user_id(user_ids)
    where(user_id: user_ids).pluck(:user_id, :id).to_h
  end

  # Replaces get_user_ids_by_storage_ids, which takes user ids despite its name.
  def self.user_ids_by_storage_id(user_ids)
    where(user_id: user_ids).pluck(:id, :user_id).to_h
  end

  # Replaces update_annoymous_user_storage_id.
  def self.claim_anonymous(storage_id, user_id)
    anonymous.where(id: storage_id).update_all(user_id: user_id)
  end

  # Replaces create_storage_id_for_user.
  def self.create_for_user(user_id = nil, anon_user_id: nil)
    create!(user_id: user_id, anon_user_id: anon_user_id).id
  rescue ActiveRecord::RecordNotUnique
    # A concurrent request created this user's storage first.
    storage_id_for_user_id(user_id) || raise("no user storage id on second try")
  end
end
