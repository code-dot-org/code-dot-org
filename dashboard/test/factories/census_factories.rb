FactoryGirl.allow_class_lookup = false

FactoryGirl.define do
  factory :census_reviewer, parent: :teacher do
    name 'Census Reviewer'
    after(:create) do |reviewer|
      reviewer.permission = UserPermission::CENSUS_REVIEWER
      reviewer.save!
    end
  end

  factory :census_submission_school_info, parent: :school_info_us do
    transient do
      school_year 2017
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
    state {Census::StateCsOffering::SUPPORTED_STATES.first}
    is_high_school
    transient do
      school_year 2017
    end

    trait :with_census_override_no do
      after(:create) do |school, evaluator|
        create :census_override, school: school, school_year: evaluator.school_year, teaches_cs: 'NO'
      end
    end

    trait :with_census_override_yes do
      after(:create) do |school, evaluator|
        create :census_override, school: school, school_year: evaluator.school_year, teaches_cs: 'YES'
      end
    end

    trait :with_census_override_maybe do
      after(:create) do |school, evaluator|
        create :census_override, school: school, school_year: evaluator.school_year, teaches_cs: 'MAYBE'
      end
    end
    trait :with_census_override_historical_yes do
      after(:create) do |school, evaluator|
        create :census_override, school: school, school_year: evaluator.school_year, teaches_cs: 'HISTORICAL_YES'
      end
    end
    trait :with_census_override_historical_no do
      after(:create) do |school, evaluator|
        create :census_override, school: school, school_year: evaluator.school_year, teaches_cs: 'HISTORICAL_NO'
      end
    end
    trait :with_census_override_historical_maybe do
      after(:create) do |school, evaluator|
        create :census_override, school: school, school_year: evaluator.school_year, teaches_cs: 'HISTORICAL_MAYBE'
      end
    end
    trait :with_census_override_nil do
      after(:create) do |school, evaluator|
        create :census_override, school: school, school_year: evaluator.school_year, teaches_cs: nil
      end
    end

    trait :with_ap_cs_offering do
      after(:create) do |school, evaluator|
        create :ap_school_code, :with_ap_cs_offering, school: school, school_year: evaluator.school_year
      end
    end

    trait :with_ib_cs_offering do
      after(:create) do |school, evaluator|
        create :ib_school_code, :with_ib_cs_offering, school: school, school_year: evaluator.school_year
      end
    end

    trait :with_state_cs_offering do
      after(:create) do |school, evaluator|
        create :state_cs_offering, school: school, school_year: evaluator.school_year
      end
    end

    trait :with_state_not_having_state_data do
      state "QQ"
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

    trait :with_teaches_yes do
      how_many_20_hours "all"
      with_topic_booleans
      with_other_description
      topic_text true
    end

    trait :with_teaches_no do
      how_many_20_hours "none"
      how_many_10_hours "none"
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

  factory :census_your_school2017v6, parent: :census_your_school2017v5, class: Census::CensusYourSchool2017v6 do
    topic_ethical_social true
  end

  factory :census_your_school2017v7, parent: :census_your_school2017v6, class: Census::CensusYourSchool2017v7 do
    trait :with_inaccuracy_reported do
      inaccuracy_reported true
    end

    trait :with_inaccuracy_comment do
      inaccuracy_comment "That ain't right!"
    end
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
    sequence(:school_code) {|n| Census::ApSchoolCode.normalize_school_code(n)}
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

    trait :with_ap_cs_offering do
      transient do
        school_year 2017
      end
      ap_cs_offering {build_list(:ap_cs_offering, 1, school_year: school_year)}
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

  factory :state_cs_offering, class: 'Census::StateCsOffering' do
    school {build :school}
    course "Some Random CS Course"
    school_year 2017

    trait :without_course do
      course nil
    end

    trait :without_school do
      school nil
    end

    trait :without_school_year do
      school_year nil
    end

    trait :with_invalid_school_year do
      school_year 1900
    end
  end

  factory :ib_school_code, class: 'Census::IbSchoolCode' do
    sequence(:school_code) {|n| Census::IbSchoolCode.normalize_school_code(n)}
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

    trait :with_ib_cs_offering do
      transient do
        school_year 2017
      end
      ib_cs_offering {build_list(:ib_cs_offering, 1, school_year: school_year)}
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

  factory :census_summary, class: 'Census::CensusSummary' do
    school {build :school}
    school_year 2017
    teaches_cs nil
    audit_data "Fake Audit Data"

    trait :with_valid_teaches_cs do
      teaches_cs "N"
    end

    trait :with_valid_historic_teaches_cs do
      teaches_cs "HN"
    end

    trait :with_invalid_teaches_cs do
      teaches_cs "X"
    end

    trait :with_invalid_school_year do
      school_year 1900
    end

    trait :without_school_year do
      school_year nil
    end

    trait :without_school do
      school nil
    end

    trait :without_audit_data do
      audit_data nil
    end
  end

  factory :census_override, class: 'Census::CensusOverride' do
    school {build :school}
    school_year 2017
    teaches_cs nil

    trait :with_valid_teaches_cs do
      teaches_cs "N"
    end

    trait :with_invalid_teaches_cs do
      teaches_cs "X"
    end

    trait :with_invalid_school_year do
      school_year 1900
    end

    trait :without_school_year do
      school_year nil
    end

    trait :without_school do
      school nil
    end
  end

  factory :census_inaccuracy_investigation, class: 'Census::CensusInaccuracyInvestigation' do
    user {build :user}
    notes "Some notes from my investigation"
    census_submission {build :census_your_school2017v7}

    trait :without_submission do
      census_submission nil
    end

    trait :without_user do
      user nil
    end

    trait :without_notes do
      notes nil
    end
  end
end
