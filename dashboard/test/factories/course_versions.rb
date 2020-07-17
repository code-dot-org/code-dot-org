# == Schema Information
#
# Table name: course_versions
#
#  id           :integer          not null, primary key
#  version_name :string(255)
#  properties   :text(65535)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#

FactoryGirl.define do
  factory :course_version do
    version_name "MyString"
    properties "MyText"
  end
end
