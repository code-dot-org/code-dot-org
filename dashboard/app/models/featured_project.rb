# == Schema Information
#
# Table name: featured_projects
#
#  id         :integer          not null, primary key
#  project_id :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class FeaturedProject < ApplicationRecord
end
