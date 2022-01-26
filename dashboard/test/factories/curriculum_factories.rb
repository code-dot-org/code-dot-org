FactoryGirl.define do
  factory :reference_guide do
    association :course_version

    position do |reference_guide|
      (reference_guide.course_version.reference_guides.maximum(:position) || 0) + 1 if reference_guide.course_version
    end

    display_name "reference guide"
    key "category/reference-guide"
    content "Some text is here\r\nand here also"
  end
end
