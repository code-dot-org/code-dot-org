# == Schema Information
#
# Table name: datablock_storage_kvps
#
#  channel_id :string(22)       not null, primary key
#  key        :string(768)      not null, primary key
#  value      :json
#
class DatablockStorageKvp < ApplicationRecord
  self.primary_keys = :channel_id, :key

  def self.set_kvps(channel_id, key_value_hashmap)
    # [
    #   {channel_id: channel_id, key: key, value: value.to_json}
    # ]
    kvps = key_value_hashmap.map do |key, value|
      {channel_id: channel_id, key: key, value: value.to_json}
    end
    # This should generate a single MySQL insert statement using the `ON DUPLICATE KEY UPDATE`
    # syntax. Should be faster than a find round-trip followed by an update or insert.
    # But we should check the SQL output to make sure its what we expect, since this is
    # mainly designed Rails-wise as a bulk insert method.
    DatablockStorageKvp.upsert_all(kvps)
  end

  def self.set_kvp(channel_id, key, value)
    if value.nil?
      # Setting a key to null deletes it
      DatablockStorageKvp.where(channel_id: channel_id, key: key).delete_all
    else
      DatablockStorageKvp.set_kvps(channel_id, {key => value})
    end
  end
end
