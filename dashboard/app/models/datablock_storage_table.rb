# == Schema Information
#
# Table name: datablock_storage_tables
#
#  channel_id      :string(22)       not null, primary key
#  table_name      :string(768)      not null, primary key
#  columns         :json
#  is_shared_table :string(768)
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
class DatablockStorageTable < ApplicationRecord
  self.primary_keys = :channel_id, :table_name
end
