# == Schema Information
#
# Table name: featured_projects
#
#  id         :integer          not null, primary key
#  project_id :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

FactoryGirl.define do
  factory :featured_project do
    project_id "MyString"
  end
end
