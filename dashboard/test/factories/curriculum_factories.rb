FactoryGirl.define do
  factory :reference_guide do
    association :course_version

    sequence(:key, 1) {|c| "bogus-reference-guide-#{c}"}
    display_name "Sample Reference Guide"
    content "Some markdown *text*"

    position do |reference_guide|
      (reference_guide.course_version.reference_guides.maximum(:position) || 0) + 1 if reference_guide.course_version
    end
  end
end
