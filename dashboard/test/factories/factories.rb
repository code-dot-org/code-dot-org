require 'cdo/activity_constants'

FactoryGirl.allow_class_lookup = false

FactoryGirl.define do
  factory :course_script do
  end

  factory :course do
    sequence(:name) {|n| "bogus-course-#{n}"}
  end

  factory :experiment do
    sequence(:name) {|n| "fancyFeature#{n}"}

    factory :user_based_experiment, class: 'UserBasedExperiment' do
      percentage 50
    end
    factory :teacher_based_experiment, class: 'TeacherBasedExperiment' do
      min_user_id 0
      max_user_id 0
      overflow_max_user_id 0
      script nil
    end
    factory :single_section_experiment, class: 'SingleSectionExperiment' do
      section
    end
    factory :single_user_experiment, class: 'SingleUserExperiment' do
    end
  end

  factory :section_hidden_stage do
    section
    stage
  end

  factory :section_hidden_script do
    section
    script
  end

  factory :paired_user_level do
    driver_user_level {user_level}
    navigator_user_level {user_level}
  end

  factory :studio_person do
  end

  factory :user do
    birthday Date.new(1991, 3, 14)
    sequence(:email) {|n| "testuser#{n}@example.com.xx"}
    password "00secret"
    locale 'en-US'
    sequence(:name) {|n| "User#{n} Codeberg"}
    user_type User::TYPE_STUDENT

    factory :teacher do
      user_type User::TYPE_TEACHER
      birthday Date.new(1980, 3, 14)
      factory :admin do
        admin true
      end
      trait :with_school_info do
        school_info
      end
      trait :with_terms_of_service do
        terms_of_service_version 1
      end
      factory :terms_of_service_teacher do
        with_terms_of_service
      end
      factory :levelbuilder do
        after(:create) do |levelbuilder|
          levelbuilder.permission = UserPermission::LEVELBUILDER
          levelbuilder.save
        end
      end
      factory :project_validator do
        after(:create) do |project_validator|
          project_validator.permission = UserPermission::PROJECT_VALIDATOR
          project_validator.save
        end
      end
      factory :facilitator do
        sequence(:name) {|n| "Facilitator Person #{n}"}
        sequence(:email) {|n| "testfacilitator#{n}@example.com.xx"}
        after(:create) do |facilitator|
          facilitator.permission = UserPermission::FACILITATOR
        end
      end
      factory :workshop_admin do
        name 'Workshop Admin'
        after(:create) do |user|
          user.permission = UserPermission::WORKSHOP_ADMIN
        end
      end
      factory :workshop_organizer do
        sequence(:name) {|n| "Workshop Organizer Person #{n}"}
        sequence(:email) {|n| "testworkshoporganizer#{n}@example.com.xx"}
        after(:create) do |workshop_organizer|
          workshop_organizer.permission = UserPermission::WORKSHOP_ORGANIZER
        end

        trait :as_regional_partner_program_manager do
          after(:create) do |workshop_organizer|
            create :regional_partner_program_manager, program_manager: workshop_organizer
          end
        end
      end
      factory :program_manager do
        transient do
          regional_partner {build :regional_partner}
        end
        after(:create) do |user, evaluator|
          create :regional_partner_program_manager, program_manager: user, regional_partner: evaluator.regional_partner
        end
      end
      factory :plc_reviewer do
        sequence(:name) {|n| "Plc Reviewer #{n}"}
        sequence(:email) {|n| "test_plc_reviewer_#{n}@example.com.xx"}
        after(:create) do |plc_reviewer|
          plc_reviewer.permission = UserPermission::PLC_REVIEWER
        end
      end
      factory :district_contact do
        name 'District Contact Person'
        ops_first_name 'District'
        ops_last_name 'Person'
        after(:create) do |district_contact|
          district_contact.permission = UserPermission::DISTRICT_CONTACT
        end
      end
      # Creates a teacher optionally enrolled in a workshop,
      # or marked attended on either all (true) or a specified list of workshop sessions.
      factory :pd_workshop_participant do
        transient do
          workshop nil
          enrolled true
          attended false
        end
        after(:create) do |teacher, evaluator|
          raise 'workshop required' unless evaluator.workshop
          create :pd_enrollment, :from_user, user: teacher, workshop: evaluator.workshop if evaluator.enrolled
          if evaluator.attended
            attended_sessions = evaluator.attended == true ? evaluator.workshop.sessions : evaluator.attended
            attended_sessions.each do |session|
              create :pd_attendance, session: session, teacher: teacher
            end
          end
        end
      end
    end

    factory :student do
      user_type User::TYPE_STUDENT

      factory :young_student do
        birthday Time.zone.today - 10.years

        factory :young_student_with_tos_teacher do
          after(:create) do |user|
            section = create(:section, user: create(:terms_of_service_teacher))
            create(:follower, section: section, student_user: user)
          end
        end

        factory :young_student_with_teacher do
          after(:create) do |user|
            section = create(:section, user: create(:teacher))
            create(:follower, section: section, student_user: user)
          end
        end

        factory :parent_managed_student do
          sequence(:parent_email) {|n| "testparent#{n}@example.com.xx"}
          email nil
          hashed_email nil
        end
      end

      factory :student_in_word_section do
        encrypted_password nil
        provider 'sponsored'

        after(:create) do |user|
          word_section = create(:section, login_type: Section::LOGIN_TYPE_WORD)
          create(:follower, student_user: user, section: word_section)
          user.reload
        end
      end

      factory :student_in_picture_section do
        encrypted_password nil
        provider 'sponsored'

        after(:create) do |user|
          picture_section = create(:section, login_type: Section::LOGIN_TYPE_PICTURE)
          create(:follower, student_user: user, section: picture_section)
          user.reload
        end
      end

      factory :google_oauth2_student do
        encrypted_password nil
        provider 'google_oauth2'
        sequence(:uid) {|n| n}
      end

      factory :old_student do
        birthday Time.zone.today - 30.years
      end
    end

    trait :with_google_authentication_option do
      after(:create) do |user|
        create(:authentication_option,
          user: user,
          email: user.email,
          hashed_email: user.hashed_email,
          credential_type: 'google_oauth',
          authentication_id: 'abcd123'
        )
      end
    end

    trait :with_clever_authentication_option do
      after(:create) do |user|
        create(:authentication_option,
          user: user,
          email: user.email,
          hashed_email: user.hashed_email,
          credential_type: 'clever',
          authentication_id: '456efgh'
        )
      end
    end

    trait :with_email_authentication_option do
      after(:create) do |user|
        create(:authentication_option,
          user: user,
          email: user.email,
          hashed_email: user.hashed_email,
          credential_type: 'email',
          authentication_id: user.hashed_email
        )
      end
    end

    trait :with_puzzles do
      transient do
        num_puzzles 1
        puzzle_result ActivityConstants::MINIMUM_PASS_RESULT
      end
      after(:create) do |user, evaluator|
        evaluator.num_puzzles.times do
          create :user_level, user: user, best_result: evaluator.puzzle_result
        end
      end
    end

    trait :deleted do
      after(:create) do |user|
        user.destroy!
        user.reload
      end
    end
  end

  factory :authentication_option do
    association :user
    email {''}
    hashed_email {''}
    credential_type {'email'}
    authentication_id {''}

    factory :email_authentication_option do
      sequence(:email) {|n| "testuser#{n}@example.com.xx"}
      after(:create) do |auth|
        auth.authentication_id = auth.hashed_email
      end
    end
  end

  factory :districts_users do
    district
    user
  end

  factory :section do
    sequence(:name) {|n| "Section #{n}"}
    user {create :teacher}
    login_type 'email'

    initialize_with {Section.new(attributes)}
  end

  factory :game do
    sequence(:name) {|n| "game#{n}.com"}
    app "maze"
  end

  factory :level, class: Blockly do
    sequence(:name) {|n| "Level_#{n}"}
    sequence(:level_num) {|n| "1_2_#{n}"}

    # User id must be non-nil for custom level
    user_id '1'
    game

    trait :with_autoplay_video do
      video_key {create(:video).key}
    end

    trait :never_autoplay_video_true do
      with_autoplay_video
      after(:create) do |level|
        level.never_autoplay_video = 'true'
        level.save!
      end
    end

    trait :never_autoplay_video_false do
      with_autoplay_video
      after(:create) do |level|
        level.never_autoplay_video = 'false'
        level.save!
      end
    end

    trait :spelling_bee do
      game {create(:game, app: "maze", name: "Maze")}
      skin 'letters'
    end

    trait :blockly do
      game {create(:game, app: "maze", name: "Maze")}
    end

    trait :unplugged do
      game {create(:game, app: "unplug")}
    end

    trait :with_ideal_level_source do
      after :create do |level, _|
        level.ideal_level_source = create(:level_source, level: level)
        level.save!
      end
    end

    trait :script do
      create(:script_level)
    end
  end

  factory :unplugged, parent: :level, class: Unplugged do
    game {create(:game, app: "unplug")}
  end

  factory :match, parent: :level, class: Match do
    game {create(:game, app: "match")}
    properties {{title: 'title', answers: [{text: 'test', correct: true}], questions: [{text: 'test'}], options: {hide_submit: false}}}
  end

  factory :text_match, parent: :level, class: TextMatch do
    game {create(:game, app: "textmatch")}
    properties {{title: 'title', questions: [{text: 'test'}], options: {hide_submit: false}}}
  end

  factory :bounce, parent: :level, class: Bounce do
  end

  factory :artist, parent: :level, class: Artist do
  end

  factory :maze, parent: :level, class: :Maze do
    skin 'birds'
  end

  factory :applab, parent: :level, class: Applab do
    game {Game.applab}

    trait :with_autoplay_video do
      video_key {create(:video).key}
    end

    trait :with_map_reference do
      map_reference '/test/alpha.html'
    end

    trait :with_reference_links do
      reference_links ['/test/abc.html', '/test/def.html']
    end
  end

  factory :free_response, parent: :level, class: FreeResponse do
    game {Game.free_response}
  end

  factory :playlab, parent: :level, class: Studio do
    game {create(:game, app: Game::PLAYLAB)}
  end

  factory :gamelab, parent: :level, class: Gamelab do
    game {Game.gamelab}
  end

  factory :weblab, parent: :level, class: Weblab do
    game {Game.weblab}
  end

  factory :multi, parent: :level, class: Multi do
    game {create(:game, app: "multi")}
    transient do
      submittable false
    end
    properties do
      {
        question: 'question text',
        answers: [
          {text: 'answer1', correct: true},
          {text: 'answer2', correct: false},
          {text: 'answer3', correct: false},
          {text: 'answer4', correct: false}
        ],
        questions: [{text: 'question text'}],
        options: {hide_submit: false},
        submittable: submittable
      }
    end
  end

  factory :evaluation_multi, parent: :level, class: EvaluationMulti do
    game {create(:game, app: 'evaluation_multi')}
  end

  factory :external, parent: :level, class: External do
  end

  factory :external_link, parent: :level, class: ExternalLink do
    game {Game.external_link}
    url nil
    link_title 'title'
  end

  factory :curriculum_reference, parent: :level, class: CurriculumReference do
    game {Game.curriculum_reference}
  end

  factory :level_source do
    level
    data '<xml/>'
    trait :with_image do
      level {create(:level, game: Game.find_by_app(Game::ARTIST))}
      after :create do |level_source, _|
        create :level_source_image, level_source: level_source
      end
    end
  end

  factory :level_source_image do
    level_source
  end

  factory :gallery_activity do
    user
    user_level {create(:user_level)}
    level_source {create(:level_source, :with_image, level: user_level.level)}
  end

  factory :script do
    sequence(:name) {|n| "bogus-script-#{n}"}
  end

  factory :featured_project do
    storage_app_id {456}
  end

  factory :script_level do
    script

    trait :assessment do
      assessment true
    end

    stage do |script_level|
      create(:stage, script: script_level.script)
    end

    trait :with_autoplay_video do
      levels {[create(:level, :with_autoplay_video)]}
    end

    levels {[create(:level)]}

    trait :never_autoplay_video_true do
      levels {[create(:level, :never_autoplay_video_true)]}
    end

    trait :never_autoplay_video_false do
      levels {[create(:level, :never_autoplay_video_false)]}
    end

    trait :playlab do
      levels {[create(:playlab)]}
    end

    chapter do |script_level|
      (script_level.script.script_levels.maximum(:chapter) || 0) + 1
    end

    position do |script_level|
      (script_level.stage.script_levels.maximum(:position) || 0) + 1 if script_level.stage
    end

    properties do |script_level|
      props = {}
      # If multiple levels are specified, mark all but the first as inactive
      if script_level.levels.length > 1
        script_level.levels[1..-1].each do |level|
          props[level.name] = {active: false}
        end
      end
      props
    end
  end

  factory :stage do
    sequence(:name) {|n| "Bogus Stage #{n}"}
    script

    absolute_position do |stage|
      (stage.script.stages.maximum(:absolute_position) || 0) + 1
    end

    # relative_position is actually the same as absolute_position in our factory
    # (i.e. it doesnt try to count lockable/non-lockable)
    relative_position do |stage|
      ((stage.script.stages.maximum(:absolute_position) || 0) + 1).to_s
    end
  end

  factory :callout do
    sequence(:element_id) {|n| "#pageElement#{n}"}
    localization_key 'drag_blocks'
    script_level
  end

  factory :activity do
    level
    user
    level_source {create :level_source, level: level}
  end

  factory :concept do
    sequence(:name) {|n| "Algorithm #{n}"}
    trait :with_video do
      video
    end
  end

  factory :video do
    sequence(:key) {|n| "concept_#{n}"}
    youtube_code 'Bogus text'
  end

  factory :follower do
    association :student_user, factory: :student

    transient do
      section nil
      user nil
    end

    after(:build) do |follower, evaluator|
      follower.user = evaluator.user ||
        evaluator.section.try(:user) ||
        build(:teacher)
      follower.section = evaluator.section || build(:section, user: follower.user)
    end
  end

  factory :user_level do
    user {create :student}
    level {create :applab}
  end

  factory :user_script do
    user {create :student}
    script
  end

  factory :cohorts_district do
    cohort
    district
    max_teachers 5
  end

  factory :cohort do
    name 'Test Cohort'
  end

  factory :district do
    sequence(:name) {|n| "District #{n}"}
    location 'Panem'
    contact {create(:district_contact)}
  end

  factory :workshop do
    sequence(:name) {|n| "My Workshop #{n}"}
    program_type '1'
    location 'Somewhere, USA'
    instructions 'Test workshop instructions.'
    facilitators {[create(:facilitator)]}
    cohorts {[create(:cohort)]}
    after :create do |workshop, _|
      create_list :segment, 1, workshop: workshop
    end
  end

  factory :segment do
    workshop
    start DateTime.now.utc
    send(:end, DateTime.now.utc + 1.day)
  end

  factory :attendance, class: WorkshopAttendance do
    segment
    teacher {create :teacher}

    status 'present'
  end

  factory :peer_review do
    submitter {create :teacher}
    from_instructor false
    script {create :script}
    level {create :level}
    level_source {create :level_source}
    data "MyText"
    before :create do |peer_review|
      create :user_level, user: peer_review.submitter, level: peer_review.level
    end
  end

  factory :level_group, class: LevelGroup do
    game {create(:game, app: "level_group")}
    transient do
      title 'title'
      submittable false
    end
    properties do
      {
        title: title,
        anonymous: false,
        submittable: submittable,
        pages: [{levels: ['level1', 'level2']}, {levels: ['level3']}]
      }
    end
  end

  factory :survey_result do
    user {create :teacher}
    kind 'Diversity2016'
    properties {{diversity_asian: "1", diversity_farm: "3"}}
  end

  factory :hint_view_request do
    user {create :student}
    script {create :script}
    level {create :level}
  end

  factory :level_concept_difficulty do
    level {create :level}
    repeat_loops 2
  end

  factory :user_proficiency do
    user {create :student}
    sequencing_d1_count 1
    repeat_loops_d2_count 2
    repeat_loops_d4_count 3
    conditionals_d5_count 4
  end

  # school info: default to public with district and school
  # Other variations have factories below
  factory :school_info, parent: :school_info_us_public do
    with_school
  end

  # this is the only factory used for testing the deprecated data formats (without country).
  factory :school_info_without_country, class: SchoolInfo do
    school_type SchoolInfo::SCHOOL_TYPE_PUBLIC
    state 'WA'
    association :school_district, strategy: :build
  end

  factory :school_info_non_us, class: SchoolInfo do
    country 'GB'
    school_type SchoolInfo::SCHOOL_TYPE_PUBLIC
    full_address '31 West Bank, London, England'
    school_name 'Grazebrook'
  end

  factory :school_info_us, class: SchoolInfo do
    country 'US'

    trait :with_district do
      association :school_district, strategy: :build
    end

    trait :with_school do
      # Use state and school_type from the parent school_info
      school {build :public_school, state: state, school_type: school_type}
    end
  end

  # although some US school types behave identically, we keep their factories separate here
  # because the behavior of each school type may diverge over time.
  factory :school_info_us_private, parent: :school_info_us do
    school_type SchoolInfo::SCHOOL_TYPE_PRIVATE
    state 'NJ'
    zip '08534'
    school_name 'Princeton Day School'
  end

  factory :school_info_us_other, parent: :school_info_us do
    school_type SchoolInfo::SCHOOL_TYPE_OTHER
    state 'NJ'
    zip '08534'
    school_name 'Princeton Day School'
  end

  factory :school_info_with_public_school_only, class: SchoolInfo do
    association :school, strategy: :build, factory: :public_school
  end

  factory :school_info_with_private_school_only, class: SchoolInfo do
    association :school, strategy: :build, factory: :private_school
  end

  factory :school_info_with_charter_school_only, class: SchoolInfo do
    association :school, strategy: :build, factory: :charter_school
  end

  factory :school_info_us_public, parent: :school_info_us do
    school_type SchoolInfo::SCHOOL_TYPE_PUBLIC
    state 'WA'
  end

  factory :school_info_us_charter, parent: :school_info_us do
    school_type SchoolInfo::SCHOOL_TYPE_CHARTER
    state 'WA'
  end

  factory :school_info_us_homeschool, parent: :school_info_us do
    school_type SchoolInfo::SCHOOL_TYPE_HOMESCHOOL
    state 'NJ'
    zip '08534'
  end

  factory :school_info_us_after_school, parent: :school_info_us do
    school_type SchoolInfo::SCHOOL_TYPE_AFTER_SCHOOL
    state 'NJ'
    zip '08534'
    school_name 'Princeton Day School'
  end

  factory :school_info_non_us_homeschool, parent: :school_info_non_us do
    school_type SchoolInfo::SCHOOL_TYPE_HOMESCHOOL
    school_name nil
  end

  factory :school_info_non_us_after_school, parent: :school_info_non_us do
    school_type SchoolInfo::SCHOOL_TYPE_AFTER_SCHOOL
  end

  # end school info

  factory :school_district do
    # School district ids are provided
    id {(SchoolDistrict.maximum(:id) + 1)}

    name "A school district"
    city "Seattle"
    state "WA"
    zip "98101"
  end

  factory :school_stats_by_year do
    grade_10_offered true
    school_year "2016-2017"
    school {build :school}

    trait :is_high_school do
      grade_09_offered true
      grade_10_offered true
      grade_11_offered true
      grade_12_offered true
      grade_13_offered true
    end

    trait :is_k8_school do
      grade_09_offered false
      grade_10_offered false
      grade_11_offered false
      grade_12_offered false
      grade_13_offered false

      grade_kg_offered true
      grade_01_offered true
      grade_02_offered true
      grade_03_offered true
      grade_04_offered true
      grade_05_offered true
      grade_06_offered true
      grade_07_offered true
      grade_08_offered true
    end
  end

  # Default school to public school. More specific factories below
  factory :school, parent: :public_school

  factory :school_common, class: School do
    # school ids are not auto-assigned, so we have to assign one here
    id {(School.maximum(:id).to_i + 1).to_s}
    city "Seattle"
    state "WA"
    zip "98122"

    trait :with_district do
      association :school_district, strategy: :build
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
  end

  factory :public_school, parent: :school_common do
    school_type SchoolInfo::SCHOOL_TYPE_PUBLIC
    name "A seattle public school"
    with_district

    state_school_id {School.construct_state_school_id(state, school_district.try(:id), id)}

    trait :without_state_school_id do
      state_school_id nil
    end

    trait :with_invalid_state_school_id do
      state_school_id "123456789"
    end
  end

  factory :private_school, parent: :school_common do
    school_type SchoolInfo::SCHOOL_TYPE_PRIVATE
    name "A seattle private school"
  end

  factory :charter_school, parent: :school_common do
    school_type SchoolInfo::SCHOOL_TYPE_CHARTER
    name "A seattle charter school"
    with_district
  end

  factory :regional_partner do
    sequence(:name) {|n| "Partner#{n}"}
    contact {create :teacher}
    group 1
  end

  factory :regional_partner_program_manager do
    regional_partner {create :regional_partner}
    program_manager {create :teacher}
  end

  factory :regional_partners_school_district do
    association :school_district
    association :regional_partner
  end

  factory :channel_token do
    transient {storage_user nil}
    # Note: This creates channel_tokens where the channel is NOT an accurately
    # encrypted version of storage_app_id/app_id
    storage_app_id 1
    storage_id {storage_user.try(:id) || 2}
  end

  factory :circuit_playground_discount_application do
  end

  factory :seeded_s3_object do
    bucket "Bucket containing object"
    key "Object Key"
    etag "Object etag"
  end
end
