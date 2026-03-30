FactoryBot.define do
  factory :reference_guide do
    association :course_version

    sequence(:key) {|n| "bogus-reference-guide-#{n}"}
    display_name {"Sample Reference Guide"}
    content {"Some markdown *text*"}

    position do |reference_guide|
      (reference_guide.course_version.reference_guides.maximum(:position) || 0) + 1 if reference_guide.course_version
    end
  end

  factory :data_doc do
    sequence(:key) {|n| "data-doc-#{n}"}
    sequence(:name) {|n| "data doc #{n}"}
    sequence(:content) {|n| "Content for data doc #{n}"}
  end

  factory :jit_pl_concept do
    sequence(:name) {|n| "jit-pl-concept-#{n}"}
    sequence(:display_name) {|n| "JIT PL Concept #{n}"}
    text_content {"Some concept text content"}
  end

  factory :jit_pl_misconception do
    association :jit_pl_concept
    sequence(:name) {|n| "jit-pl-misconception-#{n}"}
    text_content {"Some misconception text content"}
  end

  factory :jit_pl_exemplar do
    sequence(:name) {|n| "jit-pl-exemplar-#{n}"}
    text_content {"Some exemplar text content"}
    exemplar_type {"good"}
  end
end
