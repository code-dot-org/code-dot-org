# == Schema Information
#
# Table name: datablock_storage_records
#
#  project_id  :integer          not null, primary key
#  table_name  :string(700)      not null, primary key
#  record_id   :integer          not null, primary key
#  record_json :json
#
# Indexes
#
#  index_datablock_storage_records_on_project_id                 (project_id)
#  index_datablock_storage_records_on_project_id_and_table_name  (project_id,table_name)
#
class DatablockStorageRecord < ApplicationRecord
  self.primary_keys = :project_id, :table_name, :record_id

  # TODO: #57001, implement enforcement of MAX_RECORD_LENGTH, we already have
  # a test for this, but we're skipping it until this is implemented. This
  # should ensure the string form of .json is less than 4096 bytes.
  MAX_RECORD_LENGTH = 4096

  # Enabling this was adding an extra `SELECT `datablock_storage_tables`.*` query to update_record
  # and we aren't using it, soooo...
  # belongs_to :table, class_name: 'DatablockStorageTable', foreign_key: [:project_id, :table_name]
end
