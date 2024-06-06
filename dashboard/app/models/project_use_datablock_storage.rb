# == Schema Information
#
# Table name: project_use_datablock_storages
#
#  id                    :bigint           not null, primary key
#  project_id            :integer          not null
#  use_datablock_storage :boolean          default(FALSE), not null
#
# Indexes
#
#  index_project_use_datablock_storages_on_project_id  (project_id)
#
class ProjectUseDatablockStorage < ApplicationRecord
  DEFAULT_USE_DATABLOCK_STORAGE = false
  # Should a given Project use datablock storage?
  # This allows us to progressively migrate between Firebase
  # and Datablock storage.
  #
  # TODO: post-firebase-cleanup, #56994 remove this table once 100% of projects are use_datablock_storage=true.

  def self.use_data_block_storage_for?(channel_id)
    project = Project.find_by_channel_id(channel_id)
    find_by(project_id: project.id)&.use_datablock_storage || DEFAULT_USE_DATABLOCK_STORAGE
  rescue ActiveRecord::RecordNotFound
    DEFAULT_USE_DATABLOCK_STORAGE
  end

  def self.set_data_block_storage_for!(channel_id, use_datablock_storage)
    project = Project.find_by_channel_id(channel_id)
    find_or_create_by(project_id: project.id).update!(use_datablock_storage: ActiveRecord::Type::Boolean.new.cast(use_datablock_storage))
  end
end
