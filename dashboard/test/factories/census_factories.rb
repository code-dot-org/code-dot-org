FactoryBot.define do
  factory :census_submission_school_info, parent: :school_info_us do
    transient do
      school_year {2017}
    end

    trait :with_teaches_yes_teacher_census_submission do
      after(:create) do |school_info, evaluator|
        create :census_teacher_banner_v1, :with_teaches_yes, school_infos: [school_info], school_year: evaluator.school_year
      end
    end

    trait :with_teaches_no_teacher_census_submission do
      after(:create) do |school_info, evaluator|
        create :census_teacher_banner_v1, :with_teaches_no, school_infos: [school_info], school_year: evaluator.school_year
      end
    end

    trait :with_teaches_yes_parent_census_submission do
      after(:create) do |school_info, evaluator|
        create :census_your_school2017v5, :with_teaches_yes, school_infos: [school_info], submitter_role: 'parent', school_year: evaluator.school_year
      end
    end

    trait :with_teaches_no_parent_census_submission do
      after(:create) do |school_info, evaluator|
        create :census_your_school2017v5, :with_teaches_no, school_infos: [school_info], submitter_role: 'parent', school_year: evaluator.school_year
      end
    end
  end

  factory :census_school, parent: :school do
    state {'AK'}
    is_high_school
    transient do
      school_year {2017}
    end

    trait :with_state_not_having_state_data do
      state {"QQ"}
    end

    trait :with_teaches_yes_teacher_census_submission do
      after(:create) do |school, evaluator|
        create :census_submission_school_info, :with_teaches_yes_teacher_census_submission, school: school, school_year: evaluator.school_year
      end
    end

    trait :with_teaches_no_teacher_census_submission do
      after(:create) do |school, evaluator|
        create :census_submission_school_info, :with_teaches_no_teacher_census_submission, school: school, school_year: evaluator.school_year
      end
    end

    trait :with_teaches_yes_parent_census_submission do
      after(:create) do |school, evaluator|
        create :census_submission_school_info, :with_teaches_yes_parent_census_submission, school: school, school_year: evaluator.school_year
      end
    end

    trait :with_teaches_no_parent_census_submission do
      after(:create) do |school, evaluator|
        create :census_submission_school_info, :with_teaches_no_parent_census_submission, school: school, school_year: evaluator.school_year
      end
    end

    trait :with_one_year_ago_teaches_yes do
      after(:create) do |school, evaluator|
        create :census_submission_school_info, :with_teaches_yes_teacher_census_submission, school: school, school_year: evaluator.school_year - 1
      end
    end

    trait :with_one_year_ago_teaches_no do
      after(:create) do |school, evaluator|
        create :census_submission_school_info, :with_teaches_no_teacher_census_submission, school: school, school_year: evaluator.school_year - 1
      end
    end

    trait :with_one_year_ago_teaches_maybe do
      after(:create) do |school, evaluator|
        create :census_submission_school_info, :with_teaches_no_teacher_census_submission, :with_teaches_yes_teacher_census_submission, school: school, school_year: evaluator.school_year - 1
      end
    end

    trait :with_two_years_ago_teaches_yes do
      after(:create) do |school, evaluator|
        create :census_submission_school_info, :with_teaches_yes_teacher_census_submission, school: school, school_year: evaluator.school_year - 2
      end
    end

    trait :with_two_years_ago_teaches_no do
      after(:create) do |school, evaluator|
        create :census_submission_school_info, :with_teaches_no_teacher_census_submission, school: school, school_year: evaluator.school_year - 2
      end
    end

    trait :with_two_years_ago_teaches_maybe do
      after(:create) do |school, evaluator|
        create :census_submission_school_info, :with_teaches_no_teacher_census_submission, :with_teaches_yes_teacher_census_submission, school: school, school_year: evaluator.school_year - 2
      end
    end

    trait :with_three_years_ago_teaches_yes do
      after(:create) do |school, evaluator|
        create :census_submission_school_info, :with_teaches_yes_teacher_census_submission, school: school, school_year: evaluator.school_year - 3
      end
    end

    trait :with_three_years_ago_teaches_no do
      after(:create) do |school, evaluator|
        create :census_submission_school_info, :with_teaches_no_teacher_census_submission, school: school, school_year: evaluator.school_year - 3
      end
    end

    trait :with_three_years_ago_teaches_maybe do
      after(:create) do |school, evaluator|
        create :census_submission_school_info, :with_teaches_no_teacher_census_submission, :with_teaches_yes_teacher_census_submission, school: school, school_year: evaluator.school_year - 3
      end
    end
  end

  factory :census_submission, class: Census::CensusSubmission do
    submitter_email_address {"parent@school.edu"}
    school_year {2017}
    how_many_20_hours {"none"}
    how_many_10_hours {"none"}
    how_many_do_hoc {"none"}
    how_many_after_school {"none"}
    submitter_role {"parent"}
    class_frequency {"less_than_one_hour_per_week"}

    transient do
      school_info_count {1}
    end

    school_infos {build_list(:school_info, school_info_count)}

    trait :with_bad_how_many do
      how_many_20_hours {"a bunch"}
      how_many_10_hours {"not sure"}
      how_many_do_hoc {"many"}
      how_many_after_school {"all of them"}
    end

    trait :with_bad_role do
      submitter_role {"student"}
    end

    trait :with_bad_frequency do
      class_frequency {'often'}
    end

    trait :with_bad_school_year do
      school_year {1900}
    end

    trait :with_long_email do
      submitter_email_address {'a' * 256}
    end

    trait :with_long_name do
      submitter_name {'a' * 256}
    end

    trait :with_long_other_description do
      topic_other_description {'a' * 256}
    end

    trait :as_teacher do
      submitter_role {"teacher"}
    end

    trait :with_pledge do
      pledged {true}
    end

    trait :with_topic_booleans do
      topic_blocks {true}
      topic_text {true}
      topic_robots {true}
      topic_internet {true}
      topic_security {true}
      topic_data {true}
      topic_web_design {true}
      topic_game_design {true}
      topic_other {true}
      topic_do_not_know {true}
    end

    trait :with_other_description do
      topic_other_description {"Another topic"}
    end

    trait :with_teaches_yes do
      how_many_20_hours {"all"}
      with_topic_booleans
      with_other_description
      topic_text {true}
    end

    trait :with_teaches_no do
      how_many_20_hours {"none"}
      how_many_10_hours {"none"}
    end
  end

  factory :census_your_school2017v0, parent: :census_submission, class: Census::CensusYourSchool2017v0 do
  end

  factory :census_your_school2017v1, parent: :census_your_school2017v0, class: Census::CensusYourSchool2017v1 do
    trait :requiring_followup do
      how_many_20_hours {"all"}
    end
  end

  factory :census_your_school2017v2, parent: :census_your_school2017v1, class: Census::CensusYourSchool2017v2 do
    trait :requiring_other_description do
      topic_other {true}
      requiring_followup
    end
  end

  factory :census_your_school2017v3, parent: :census_your_school2017v2, class: Census::CensusYourSchool2017v3 do
  end

  factory :census_your_school2017v4, parent: :census_your_school2017v3, class: Census::CensusYourSchool2017v4 do
  end

  factory :census_your_school2017v5, parent: :census_your_school2017v4, class: Census::CensusYourSchool2017v5 do
    share_with_regional_partners {true}
  end

  factory :census_your_school2017v6, parent: :census_your_school2017v5, class: Census::CensusYourSchool2017v6 do
    topic_ethical_social {true}
  end

  factory :census_your_school2017v7, parent: :census_your_school2017v6, class: Census::CensusYourSchool2017v7 do
    trait :with_inaccuracy_reported do
      inaccuracy_reported {true}
    end

    trait :with_inaccuracy_comment do
      inaccuracy_comment {"That ain't right!"}
    end
  end

  factory :census_hoc2017v1, parent: :census_submission, class: Census::CensusHoc2017v1 do
    submitter_name {"Hoc Submitter"}
  end

  factory :census_hoc2017v2, parent: :census_hoc2017v1, class: Census::CensusHoc2017v2 do
  end

  factory :census_hoc2017v3, parent: :census_hoc2017v2, class: Census::CensusHoc2017v3 do
  end

  factory :census_submission_form_map, class: Census::CensusSubmissionFormMap do
    census_submission {nil}
    form_id {nil}

    trait :with_submission do
      census_submission {build :census_hoc2017v1}
    end

    trait :with_form do
      form_id {1}
    end
  end

  factory :census_teacher_banner_v1, parent: :census_submission, class: Census::CensusTeacherBannerV1 do
    submitter_role {"TEACHER"}
  end

  factory :census_summary, class: 'Census::CensusSummary' do
    school {build :school}
    school_year {2017}
    teaches_cs {nil}

    trait :with_valid_teaches_cs do
      teaches_cs {"N"}
    end

    trait :with_valid_historic_teaches_cs do
      teaches_cs {"HN"}
    end

    trait :with_invalid_teaches_cs do
      teaches_cs {"X"}
    end

    trait :with_invalid_school_year do
      school_year {1900}
    end

    trait :without_school_year do
      school_year {nil}
    end

    trait :without_school do
      school {nil}
    end
  end
end
