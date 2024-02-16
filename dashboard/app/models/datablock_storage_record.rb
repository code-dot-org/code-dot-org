# == Schema Information
#
# Table name: datablock_storage_records
#
#  project_id  :integer          not null, primary key
#  table_name  :string(768)      not null, primary key
#  record_id   :integer          not null, primary key
#  record_json :json
#
# Indexes
#
#  index_datablock_storage_records_on_project_id_and_table_name  (project_id,table_name)
#
class DatablockStorageRecord < ApplicationRecord
  self.primary_keys = :project_id, :table_name, :record_id

  # Enabling this was adding an extra `SELECT `datablock_storage_tables`.*` query to update_record
  # and we aren't using it, soooo...
  # belongs_to :table, class_name: 'DatablockStorageTable', foreign_key: [:project_id, :table_name]
end
