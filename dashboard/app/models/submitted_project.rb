# == Schema Information
#
# Table name: submitted_projects
#
#  id          :bigint           not null, primary key
#  project_id  :integer
#  description :string(255)
#  declined_at :datetime
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_submitted_projects_on_project_id  (project_id) UNIQUE
#
class SubmittedProject < ApplicationRecord
end
