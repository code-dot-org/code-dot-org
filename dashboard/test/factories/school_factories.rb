FactoryBot.define do
  # school info: default to public with district and school
  # Other variations have factories below
  factory :school_info, parent: :school_info_us_public do
    with_school
  end

  # this is the only factory used for testing the deprecated data formats (without country).
  factory :school_info_without_country, class: SchoolInfo do
    school_type {SchoolInfo::SCHOOL_TYPE_PUBLIC}
    state {'WA'}
    association :school_district
  end

  factory :school_info_non_us, class: SchoolInfo do
    country {'GB'}
    school_type {SchoolInfo::SCHOOL_TYPE_PUBLIC}
    full_address {'31 West Bank, London, England'}
    school_name {'Grazebrook'}
  end

  factory :school_info_us, class: SchoolInfo do
    country {'US'}

    trait :with_district do
      association :school_district
    end

    trait :with_school do
      # Use state and school_type from the parent school_info. Also make sure
      # that we create rather than just building the school, to accommodate the
      # custom School#id logic
      school {create :public_school, state: state, school_type: school_type}
    end
  end

  # although some US school types behave identically, we keep their factories separate here
  # because the behavior of each school type may diverge over time.
  factory :school_info_us_private, parent: :school_info_us do
    school_type {SchoolInfo::SCHOOL_TYPE_PRIVATE}
    state {'NJ'}
    zip {'08534'}
    school_name {'Princeton Day School'}
  end

  factory :school_info_us_other, parent: :school_info_us do
    school_type {SchoolInfo::SCHOOL_TYPE_OTHER}
    state {'NJ'}
    zip {'08534'}
    school_name {'Princeton Day School'}
  end

  factory :school_info_with_public_school_only, class: SchoolInfo do
    association :school, factory: :public_school
  end

  factory :school_info_with_private_school_only, class: SchoolInfo do
    association :school, factory: :private_school
  end

  factory :school_info_with_charter_school_only, class: SchoolInfo do
    association :school, factory: :charter_school
  end

  factory :school_info_us_public, parent: :school_info_us do
    school_type {SchoolInfo::SCHOOL_TYPE_PUBLIC}
    state {'WA'}
  end

  factory :school_info_us_charter, parent: :school_info_us do
    school_type {SchoolInfo::SCHOOL_TYPE_CHARTER}
    state {'WA'}
  end

  factory :school_info_us_homeschool, parent: :school_info_us do
    school_type {SchoolInfo::SCHOOL_TYPE_HOMESCHOOL}
    state {'NJ'}
    zip {'08534'}
  end

  factory :school_info_us_after_school, parent: :school_info_us do
    school_type {SchoolInfo::SCHOOL_TYPE_AFTER_SCHOOL}
    state {'NJ'}
    zip {'08534'}
    school_name {'Princeton Day School'}
  end

  factory :school_info_non_us_homeschool, parent: :school_info_non_us do
    school_type {SchoolInfo::SCHOOL_TYPE_HOMESCHOOL}
    school_name {nil}
  end

  factory :school_info_non_us_after_school, parent: :school_info_non_us do
    school_type {SchoolInfo::SCHOOL_TYPE_AFTER_SCHOOL}
  end

  # end school info

  factory :school_district do
    # School district ids are provided
    id {(SchoolDistrict.maximum(:id) || 0) + 1}

    name {"A school district"}
    city {"Seattle"}
    state {"WA"}
    zip {"98101"}
  end

  factory :school_stats_by_year do
    grade_10_offered {true}
    school_year {"2016-2017"}
    school {build :school}

    trait :is_high_school do
      grade_09_offered {true}
      grade_10_offered {true}
      grade_11_offered {true}
      grade_12_offered {true}
      grade_13_offered {true}
    end

    trait :is_k8_school do
      grade_09_offered {false}
      grade_10_offered {false}
      grade_11_offered {false}
      grade_12_offered {false}
      grade_13_offered {false}

      grade_kg_offered {true}
      grade_01_offered {true}
      grade_02_offered {true}
      grade_03_offered {true}
      grade_04_offered {true}
      grade_05_offered {true}
      grade_06_offered {true}
      grade_07_offered {true}
      grade_08_offered {true}
    end

    # Schools eligible for circuit playground discount codes
    # are schools where over 50% of students are eligible
    # for free and reduced meals.
    trait :is_maker_high_needs_school do
      frl_eligible_total {51}
      students_total {100}
    end
  end

  # Default school to public school. More specific factories below
  factory :school, parent: :public_school

  factory :school_common, class: School do
    # school ids are not auto-assigned, so we have to assign one here
    id {((School.maximum(:id) || 0).next).to_s}
    address_line1 {"123 Sample St"}
    address_line2 {"attn: Main Office"}
    city {"Seattle"}
    state {"WA"}
    zip {"98122"}

    trait :with_district do
      association :school_district
    end

    trait :is_high_school do
      after(:create) do |school|
        create :school_stats_by_year, :is_high_school, school: school
      end
    end

    trait :is_k8_school do
      after(:create) do |school|
        build :school_stats_by_year, :is_k8_school, school: school
      end
    end

    trait :is_maker_high_needs_school do
      after(:create) do |school|
        create :school_stats_by_year, :is_maker_high_needs_school, school: school
      end
    end
  end

  factory :public_school, parent: :school_common do
    school_type {SchoolInfo::SCHOOL_TYPE_PUBLIC}
    name {"A seattle public school"}
    with_district

    state_school_id {School.construct_state_school_id(state, school_district.try(:id), id)}

    trait :without_state_school_id do
      state_school_id {nil}
    end

    trait :with_invalid_state_school_id do
      state_school_id {"123456789"}
    end
  end

  factory :private_school, parent: :school_common do
    school_type {SchoolInfo::SCHOOL_TYPE_PRIVATE}
    name {"A seattle private school"}
  end

  factory :charter_school, parent: :school_common do
    school_type {SchoolInfo::SCHOOL_TYPE_CHARTER}
    name {"A seattle charter school"}
    with_district
  end
end
