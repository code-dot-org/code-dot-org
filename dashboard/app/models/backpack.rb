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
  belongs_to :user, optional: true

  # The projects table used to be named storage_apps. This column has not been renamed
  # to reflect the new table name, so an alias is used to clarify which table this ID maps to.
  alias_attribute :project_id, :storage_app_id

  def self.find_or_create(user_id, ip)
    backpack = find_by_user_id(user_id)
    unless backpack
      # Create a project for this user's backpack
      project = Projects.new(storage_id_for_user_id(user_id))
      encrypted_id = project.create({hidden: true}, ip: ip, type: 'backpack')
      _, project_id = storage_decrypt_channel_id(encrypted_id)
      backpack = create!(user_id: user_id, project_id: project_id)
    end
    backpack
  end

  def channel
    storage_encrypt_channel_id(storage_id_for_user_id(user_id), project_id)
  end
end
