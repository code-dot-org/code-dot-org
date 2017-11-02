FactoryGirl.allow_class_lookup = false

FactoryGirl.define do
  factory :census_submission, class: Census::CensusSubmission do
    school_year 2017
    how_many_20_hours "none"
    how_many_10_hours "none"
    how_many_do_hoc "none"
    how_many_after_school "none"
    submitter_role "parent"
    class_frequency "one_hour_per_week"

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

    trait :with_long_tell_us_more do
      tell_us_more 'a' * 256
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

  factory :census_your_school2017v1, parent: :census_submission, class: Census::CensusYourSchool2017v1 do
    submitter_email_address "parent@school.edu"

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

  factory :census_hoc2017v1, parent: :census_submission, class: Census::CensusHoc2017v1 do
    submitter_email_address "hoc@email.address"
    submitter_name "Hoc Submitter"
  end

  factory :census_hoc2017v2, parent: :census_hoc2017v1, class: Census::CensusHoc2017v2 do
  end

  factory :census_hoc2017v3, parent: :census_hoc2017v2, class: Census::CensusHoc2017v3 do
  end
end
