FactoryGirl.allow_class_lookup = false

FactoryGirl.define do
  factory :census_submission, class: Census::CensusSubmission do
    submitter_email_address "parent@school.edu"
    school_year 2017
    how_many_20_hours "none"
    how_many_10_hours "none"
    how_many_do_hoc "none"
    how_many_after_school "none"
    submitter_role "parent"
    class_frequency "less_than_one_hour_per_week"

    transient do
      school_info_count 1
    end

    school_infos {build_list(:school_info, school_info_count)}

    trait :with_bad_how_many do
      how_many_20_hours "a bunch"
      how_many_10_hours "not sure"
      how_many_do_hoc "many"
      how_many_after_school "all of them"
    end

    trait :with_bad_role do
      submitter_role "student"
    end

    trait :with_bad_frequency do
      class_frequency 'often'
    end

    trait :with_bad_school_year do
      school_year 1900
    end

    trait :with_long_email do
      submitter_email_address 'a' * 256
    end

    trait :with_long_name do
      submitter_name 'a' * 256
    end

    trait :with_long_other_description do
      topic_other_description 'a' * 256
    end

    trait :as_teacher do
      submitter_role "teacher"
    end

    trait :with_pledge do
      pledged true
    end

    trait :with_topic_booleans do
      topic_blocks true
      topic_text true
      topic_robots true
      topic_internet true
      topic_security true
      topic_data true
      topic_web_design true
      topic_game_design true
      topic_other true
      topic_do_not_know true
    end

    trait :with_other_description do
      topic_other_description "Another topic"
    end
  end

  factory :census_your_school2017v0, parent: :census_submission, class: Census::CensusYourSchool2017v0 do
  end

  factory :census_your_school2017v1, parent: :census_your_school2017v0, class: Census::CensusYourSchool2017v1 do
    trait :requiring_followup do
      how_many_20_hours "all"
    end
  end

  factory :census_your_school2017v2, parent: :census_your_school2017v1, class: Census::CensusYourSchool2017v2 do
    trait :requiring_other_description do
      topic_other true
      requiring_followup
    end
  end

  factory :census_your_school2017v3, parent: :census_your_school2017v2, class: Census::CensusYourSchool2017v3 do
  end

  factory :census_your_school2017v4, parent: :census_your_school2017v3, class: Census::CensusYourSchool2017v4 do
  end

  factory :census_your_school2017v5, parent: :census_your_school2017v4, class: Census::CensusYourSchool2017v5 do
    share_with_regional_partners true
  end

  factory :census_hoc2017v1, parent: :census_submission, class: Census::CensusHoc2017v1 do
    submitter_name "Hoc Submitter"
  end

  factory :census_hoc2017v2, parent: :census_hoc2017v1, class: Census::CensusHoc2017v2 do
  end

  factory :census_hoc2017v3, parent: :census_hoc2017v2, class: Census::CensusHoc2017v3 do
  end

  factory :census_submission_form_map, class: Census::CensusSubmissionFormMap do
    census_submission nil
    form_id nil

    trait :with_submission do
      census_submission {build :census_hoc2017v1}
    end

    trait :with_form do
      form_id 1
    end
  end

  factory :census_teacher_banner_v1, parent: :census_submission, class: Census::CensusTeacherBannerV1 do
    submitter_role "TEACHER"
  end

  factory :ap_school_code, class: 'Census::ApSchoolCode' do
    school_code "123456"
    school {create :school}

    trait :without_school_code do
      school_code nil
    end

    trait :without_school do
      school nil
    end

    trait :with_too_long_school_code do
      school_code "12345678"
    end

    trait :with_invalid_school_code do
      school_code "ABCDEF"
    end
  end

  factory :ap_cs_offering, class: 'Census::ApCsOffering' do
    ap_school_code {build :ap_school_code}
    course "CSP"
    school_year 2017

    trait :without_course do
      course nil
    end

    trait :with_invalid_course do
      course "ABC"
    end

    trait :without_school_code do
      ap_school_code nil
    end

    trait :without_school_year do
      school_year nil
    end

    trait :with_invalid_school_year do
      school_year 1900
    end
  end

  factory :ib_school_code, class: 'Census::IbSchoolCode' do
    school_code "123456"
    school {create :school}

    trait :without_school_code do
      school_code nil
    end

    trait :with_too_long_school_code do
      school_code "12345678"
    end

    trait :without_school do
      school nil
    end

    trait :with_invalid_school_code do
      school_code "ABCDEF"
    end
  end

  factory :ib_cs_offering, class: 'Census::IbCsOffering' do
    ib_school_code {build :ib_school_code}
    level "HL"
    school_year 2017

    trait :without_level do
      level nil
    end

    trait :with_invalid_level do
      level "ABC"
    end

    trait :without_school_code do
      ib_school_code nil
    end

    trait :without_school_year do
      school_year nil
    end

    trait :with_invalid_school_year do
      school_year 1900
    end
  end
end
