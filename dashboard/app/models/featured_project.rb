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

  # The projects table used to be named storage_apps. This column has not been renamed
  # to reflect the new table name, so an alias is used to clarify which table this ID maps to.
  alias_attribute :project_id, :storage_app_id

  def featured?
    !featured_at.nil? && unfeatured_at.nil?
  end

  # Determines if a project is currently featured by decrypting the provided
  # encrypted_project_id, using the project_id to check for a
  # FeaturedProject with the corresponding project_id.  If there is a
  # FeaturedProject with that project_id, check if it is currently featured.
  # @param encrypted_project_id [string]
  # @return [Boolean] whether the project associated with the given
  # encrypted_project_id is currently featured
  # TODO: maureen rename
  def self.featured_channel_id?(encrypted_project_id)
    _, project_id = storage_decrypt_project_id encrypted_project_id
    find_by(project_id: project_id)&.featured?
  rescue ArgumentError
    false
  end
end
