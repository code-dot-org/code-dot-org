# == Schema Information
#
# Table name: records
#
#  channel_id :string(22)       not null, primary key
#  table_name :string(768)      not null, primary key
#  record_id  :integer          not null, primary key
#  json       :json
#
# Indexes
#
#  index_records_on_channel_id_and_table_name  (channel_id,table_name)
#
class Record < ApplicationRecord
  self.primary_keys = :channel_id, :table_name, :record_id
end
