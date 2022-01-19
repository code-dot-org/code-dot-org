# == Schema Information
#
# Table name: reference_guides
#
#  id                :bigint           not null, primary key
#  name              :string(255)
#  slug              :string(255)
#  course_version_id :integer
#  content           :text(65535)
#  order             :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
FactoryGirl.define do
  factory :reference_guide do
    name "reference guide"
    slug "category/reference-guide"
    course_version_id 1
    content "Some text is here\r\nand here also"
    order 1
  end
end
