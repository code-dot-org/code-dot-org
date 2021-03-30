# == Schema Information
#
# Table name: featured_projects
#
#  id             :integer          not null, primary key
#  storage_app_id :integer
#  featured_at    :datetime
#  unfeatured_at  :datetime
#  topic          :string(255)
#
# Indexes
#
#  index_featured_projects_on_storage_app_id  (storage_app_id) UNIQUE
#  index_featured_projects_on_topic           (topic)
#

class FeaturedProject < ApplicationRecord
  validates_uniqueness_of :storage_app_id

  def featured?
    !featured_at.nil? && unfeatured_at.nil?
  end

  # Determines if a project is currently featured by decrypting the provided
  # encrypted_channel_id, using the storage_app_id to check for a
  # FeaturedProject with the corresponding storage_app_id.  If there is a
  # FeaturedProject with that storage_app_id, check if it is currently featured.
  # @param encrypted_channel_id [string]
  # @return [Boolean] whether the project associated with the given
  # encrypted_channel_id is currently featured
  def self.featured_channel_id?(encrypted_channel_id)
    _, storage_app_id = storage_decrypt_channel_id encrypted_channel_id
    find_by(storage_app_id: storage_app_id)&.featured?
  rescue ArgumentError
    false
  end
end
