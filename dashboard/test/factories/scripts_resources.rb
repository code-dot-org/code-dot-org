# == Schema Information
#
# Table name: scripts_resources
#
#  id          :bigint           not null, primary key
#  script_id   :integer
#  resource_id :integer
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
FactoryGirl.define do
  factory :scripts_resource do
    script_id 1
    resource_id 1
  end
end
