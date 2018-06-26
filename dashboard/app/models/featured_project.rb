# == Schema Information
#
# Table name: featured_projects
#
#  id             :integer          not null, primary key
#  storage_app_id :integer
#  featured_at    :datetime
#  unfeatured_at  :datetime
#
# Indexes
#
#  index_featured_projects_on_storage_app_id  (storage_app_id) UNIQUE
#

class FeaturedProject < ApplicationRecord
  validates_uniqueness_of :storage_app_id

  def featured?
    !featured_at.nil? && unfeatured_at.nil?
  end

  def self.featured?(encrypted_channel_id)
    _, channel_id = storage_decrypt_channel_id encrypted_channel_id
    find_by(storage_app_id: channel_id)&.featured?
  rescue
    false
  end
end
