# == Schema Information
#
# Table name: featured_projects
#
#  id             :integer          not null, primary key
#  project_id     :string(255)
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  storage_app_id :integer
#

class FeaturedProject < ApplicationRecord
end
