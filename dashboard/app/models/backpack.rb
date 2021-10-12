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
#  index_backpacks_on_storage_app_id  (storage_app_id) UNIQUE
#  index_backpacks_on_user_id         (user_id) UNIQUE
#
class Backpack < ApplicationRecord
  belongs_to :user

  def self.find_or_create(user_id, ip)
    backpack = find_by_user_id(user_id)
    unless backpack
      # Create a storage app for this user's backpack
      storage_app = StorageApps.new(storage_id_for_user_id(user_id))
      encrypted_id = storage_app.create({'hidden': true}, ip: ip, type: 'backpack')
      _, storage_app_id = storage_decrypt_channel_id(encrypted_id)
      backpack = create!(user_id: user_id, storage_app_id: storage_app_id)
    end
    backpack
  end

  def channel
    storage_encrypt_channel_id(storage_id_for_user_id(user_id), storage_app_id)
  end
end
