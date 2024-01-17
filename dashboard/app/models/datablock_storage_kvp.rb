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
end
