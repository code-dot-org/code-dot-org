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
end
