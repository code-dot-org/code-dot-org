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
  # Stores student-owned records for App Lab's data features, see datablock_storage_controller.rb
  # Most code that manipulates records lives in datablock_storage_table.rb
  # Data is stored as a mysql-row-per-student-record

  # Composite primary key:
  self.primary_key = :project_id, :table_name, :record_id

  validate :max_record_length

  StudentFacingError = DatablockStorageTable::StudentFacingError

  MAX_RECORD_LENGTH = 4096

  private def max_record_length
    if record_json.to_json.bytesize > MAX_RECORD_LENGTH
      raise StudentFacingError.new(:MAX_RECORD_LENGTH_EXCEEDED), "The record is too large. The maximum allowable size is #{DatablockStorageRecord::MAX_RECORD_LENGTH} bytes ('characters')"
    end
  end
end
