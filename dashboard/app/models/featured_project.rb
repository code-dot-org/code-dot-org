# == Schema Information
#
# Table name: featured_projects
#
#  id             :integer          not null, primary key
#  storage_app_id :integer
#  unfeatured_at  :datetime
#  featured_at    :datetime
#
# Indexes
#
#  index_featured_projects_on_storage_app_id  (storage_app_id)
#

class FeaturedProject < ApplicationRecord
end
