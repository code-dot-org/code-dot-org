# == Schema Information
#
# Table name: datablock_storage_kvps
#
#  project_id :integer          not null, primary key
#  key        :string(700)      not null, primary key
#  value      :json
#
class DatablockStorageKvp < ApplicationRecord
  self.primary_keys = :project_id, :key

  StudentFacingError = DatablockStorageTable::StudentFacingError

  # TODO: implement enforcement of MAX_VALUE_LENGTH, we already have a test for it
  # but we're skipping it until this is implemented.
  MAX_VALUE_LENGTH = 4096

  def self.get_kvps(project_id)
    where(project_id: project_id).
      select(:key, :value).
      to_h {|kvp| [kvp.key, JSON.parse(kvp.value)]}
  end

  def self.set_kvps(project_id, key_value_hashmap, upsert: true)
    kvps = key_value_hashmap.map do |key, value|
      {project_id: project_id, key: key, value: value.to_json}
    end

    if upsert
      # This should generate a single MySQL insert statement using the `ON DUPLICATE KEY UPDATE`
      # syntax. Should be faster than a find round-trip followed by an update or insert.
      # But we should check the SQL output to make sure its what we expect, since this is
      # mainly designed Rails-wise as a bulk insert method.
      DatablockStorageKvp.upsert_all(kvps)
    else
      DatablockStorageKvp.insert_all(kvps)
    end
  end

  def self.set_kvp(project_id, key, value)
    if value.nil?
      # Setting a key to null deletes it
      DatablockStorageKvp.where(project_id: project_id, key: key).delete_all
    else
      DatablockStorageKvp.set_kvps(project_id, {key => value}, upsert: true)
    end
  end
end
