# == Schema Information
#
# Table name: key_value_pairs
#
#  channel_id :string(22)       not null, primary key
#  key        :string(768)      not null, primary key
#  value      :string(4096)
#
class KeyValuePair < ApplicationRecord
  self.primary_keys = :channel_id, :key
end
