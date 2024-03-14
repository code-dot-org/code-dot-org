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
  self.primary_keys = :project_id, :key

  StudentFacingError = DatablockStorageTable::StudentFacingError

  # TODO: #56999, implement enforcement of MAX_VALUE_LENGTH, we already have
  # a test for it, but we're skipping it until this is implemented.
  MAX_VALUE_LENGTH = 4096

  # TODO: #57000, implement encforement of MAX_NUM_KVPS. We didn't find enfocrement
  # of this in Firebase in our initial exploration, so we may need to partly pick
  # a value here and start enforcing it, previous exploration:
  # https://github.com/code-dot-org/code-dot-org/issues/55554#issuecomment-1876143286
  MAX_NUM_KVPS = 20000 # does firebase already have a  limit? this matches max num table rows

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
      # This should generate a single MySQL insert statement using `ON DUPLICATE KEY UPDATE`
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
