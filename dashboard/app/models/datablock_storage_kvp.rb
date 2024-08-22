# == Schema Information
#
# Table name: datablock_storage_kvps
#
#  project_id :integer          not null, primary key
#  key        :string(700)      not null, primary key
#  value      :json
#
# Indexes
#
#  index_datablock_storage_kvps_on_project_id  (project_id)
#
class DatablockStorageKvp < ApplicationRecord
  # Stores student-owned KVP data for App Lab's data features, see datablock_storage_controller.rb
  # Each key-value-pair is per-project, and is stored as a row in the table,
  # which has a key column and a value column.

  self.primary_key = :project_id, :key

  validate :max_kvp_count, on: :create
  validate :max_value_length, on: [:create, :update]

  StudentFacingError = DatablockStorageTable::StudentFacingError

  MAX_VALUE_LENGTH = 4096

  MAX_NUM_KVPS = 20000

  def self.get_kvps(project_id)
    where(project_id: project_id).
      select(:key, :value).
      to_h {|kvp| [kvp.key, kvp.value]}
  end

  def self.set_kvps(project_id, key_value_hashmap, upsert: true)
    kvps = key_value_hashmap.map do |key, value|
      kvp_attr = {project_id: project_id, key: key, value: value}
      DatablockStorageKvp.new(kvp_attr).valid?
      kvp_attr
    end

    if upsert
      # This should generate a single MySQL insert statement using `ON DUPLICATE KEY UPDATE`
      DatablockStorageKvp.upsert_all(kvps)
    else
      DatablockStorageKvp.insert_all(kvps)
    end
  rescue ActiveRecord::ValueTooLong
    raise StudentFacingError.new(:KEY_INVALID), "The key is too large, it must be shorter than #{columns_hash['key'].limit} bytes ('characters')"
  end

  def self.set_kvp(project_id, key, value)
    if value.nil?
      # Setting a key to null deletes it
      DatablockStorageKvp.where(project_id: project_id, key: key).delete_all
    else
      DatablockStorageKvp.set_kvps(project_id, {key => value}, upsert: true)
    end
  end

  private def max_kvp_count
    current_count = DatablockStorageKvp.where(project_id: project_id).count
    if current_count >= MAX_NUM_KVPS
      raise StudentFacingError.new(:MAX_KVPS_EXCEEDED), "Cannot have more than #{MAX_NUM_KVPS} key-value pairs per project"
    end
  end

  private def max_value_length
    if value.to_json.bytesize > MAX_VALUE_LENGTH
      raise StudentFacingError.new(:MAX_VALUE_LENGTH_EXCEEDED), "The value is too large, it must be shorter than #{MAX_VALUE_LENGTH} bytes ('characters')"
    end
  end
end
