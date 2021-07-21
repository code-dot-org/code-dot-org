# == Schema Information
#
# Table name: backpacks
#
#  id             :bigint           not null, primary key
#  user_id        :integer          not null
#  storage_app_id :integer          not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_backpacks_on_user_id  (user_id)
#
class Backpack < ApplicationRecord
  belongs_to :user
  validates_uniqueness_of :storage_app_id
  validates_uniqueness_of :user_id

  def self.create_for_user(user_id, ip)
    # Create a storage app for this user's backpack
    storage_app = StorageApps.new(get_storage_id)
    encrypted_id = storage_app.create('', ip: ip, type: 'backpack')
    _, storage_app_id = storage_decrypt_channel_id(encrypted_id)
    create!(user_id: user_id, storage_app_id: storage_app_id)
  end

  def channel
    storage_encrypt_channel_id(get_storage_id, storage_app_id)
  end
end
