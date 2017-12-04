# == Schema Information
#
# Table name: featured_projects
#
#  id             :integer          not null, primary key
#  created_at     :datetime         not null
#  storage_app_id :integer
#
# Indexes
#
#  index_featured_projects_on_storage_app_id  (storage_app_id)
#

class FeaturedProject < ApplicationRecord
end
