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
    birthday Time.zone.today - 21.years
    email {("#{user_type}_#{(User.maximum(:id) || 0) + 1}@code.org")}
    password "00secret"
    locale 'en-US'
    sequence(:name) {|n| "User#{n} Codeberg"}
    user_type User::TYPE_STUDENT

    # Used to test specific interactions for older (unmigrated) users. This
    # trait and associated tests can be removed when the work to migrate all
    # users has been completed.
    # TODO elijah
    trait :demigrated do
      after(:create, &:demigrate_from_multi_auth)
    end

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
      factory :authorized_teacher do
        after(:create) do |authorized_teacher|
          authorized_teacher.permission = UserPermission::AUTHORIZED_TEACHER
          authorized_teacher.save
        end
      end
      factory :facilitator do
        transient do
          course nil
        end

        sequence(:name) {|n| "Facilitator Person #{n}"}
        email {("Facilitator_#{(User.maximum(:id) || 0) + 1}@code.org")}

        after(:create) do |facilitator, evaluator|
          facilitator.permission = UserPermission::FACILITATOR

          if evaluator.course
            create :pd_course_facilitator, facilitator: facilitator, course: evaluator.course
          end
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
        email {("WorkshopOrganizer_#{(User.maximum(:id) || 0) + 1}@code.org")}
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
      transient {pilot_experiment nil}
      after(:create) do |teacher, evaluator|
        if evaluator.pilot_experiment
          create :single_user_experiment, min_user_id: teacher.id, name: evaluator.pilot_experiment
        end
      end
      transient {editor_experiment nil}
      after(:create) do |teacher, evaluator|
        if evaluator.editor_experiment
          create :single_user_experiment, min_user_id: teacher.id, name: evaluator.editor_experiment
        end
      end
      factory :platformization_partner do
        editor_experiment 'platformization-partners'
      end

      # We have some teacher records in our system that do not pass validation because they have
      # no email address.  Sometimes we want to test against this case because we still want features
      # to work for these teachers.
      trait :without_email do
        after(:create) do |user|
          user.update_primary_contact_info new_email: '', new_hashed_email: ''
          user.save validate: false
        end
      end
    end

    factory :student do
      user_type User::TYPE_STUDENT
      birthday Time.zone.today - 17.years

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
          provider nil
        end
      end

      factory :manual_username_password_student do
        email nil
        hashed_email nil
        provider User::PROVIDER_MANUAL
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
        in_picture_section
      end

      factory :old_student do
        birthday Time.zone.today - 30.years
      end

      trait :in_picture_section do
        after(:create) do |user|
          picture_section = create(:section, login_type: Section::LOGIN_TYPE_PICTURE)
          create(:follower, student_user: user, section: picture_section)
          user.reload
        end
      end

      trait :in_email_section do
        after(:create) do |user|
          section = create :section, login_type: Section::LOGIN_TYPE_EMAIL
          create :follower, student_user: user, section: section
          user.reload
        end
      end

      trait :migrated_imported_from_google_classroom do
        google_sso_provider
        without_email
        after(:create) do |user|
          section = create :section, login_type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM
          create :follower, student_user: user, section: section
          user.reload
        end
      end

      trait :without_email do
        email ''
        hashed_email nil
      end
    end

    trait :sso_provider do
      encrypted_password nil
      provider %w(facebook windowslive clever).sample
      sequence(:uid) {|n| n}
    end

    trait :sso_provider_with_token do
      sso_provider
      oauth_token 'fake-oauth-token'
      oauth_token_expiration 'fake-oauth-token-expiration'
    end

    trait :untrusted_email_sso_provider do
      sso_provider_with_token
      after(:create) do |user|
        if user.student?
          user.hashed_email = nil
          user.save!
        end
      end
    end

    trait :clever_sso_provider do
      untrusted_email_sso_provider
      provider 'clever'
    end

    trait :facebook_sso_provider do
      sso_provider_with_token
      provider 'facebook'
    end

    trait :google_sso_provider do
      sso_provider_with_token
      provider 'google_oauth2'
      oauth_refresh_token 'fake-oauth-refresh-token'
    end

    trait :powerschool_sso_provider do
      untrusted_email_sso_provider
      provider 'powerschool'
    end

    trait :the_school_project_sso_provider do
      sso_provider
      provider 'the_school_project'
    end

    trait :twitter_sso_provider do
      sso_provider
      provider 'twitter'
    end

    trait :qwiklabs_sso_provider do
      sso_provider
      provider 'lti_lti_prod_kids.qwikcamps.com'
    end

    trait :windowslive_sso_provider do
      sso_provider_with_token
      provider 'windowslive'
    end

    trait :with_google_authentication_option do
      after(:create) do |user|
        create(:authentication_option,
          user: user,
          email: user.email,
          hashed_email: user.hashed_email,
          credential_type: AuthenticationOption::GOOGLE,
          authentication_id: 'abcd123',
          data: {
            oauth_token: 'some-google-token',
            oauth_refresh_token: 'some-google-refresh-token',
            oauth_token_expiration: '999999'
          }.to_json
        )
      end
    end

    trait :with_clever_authentication_option do
      after(:create) do |user|
        create(:authentication_option,
          user: user,
          email: user.email,
          hashed_email: user.hashed_email,
          credential_type: AuthenticationOption::CLEVER,
          authentication_id: '456efgh',
          data: {
            oauth_token: 'some-clever-token'
          }.to_json
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

    trait :within_united_states do
      after(:create) do |user|
        create :user_geo, :seattle, user: user
      end
    end

    trait :outside_united_states do
      after(:create) do |user|
        create :user_geo, :sydney, user: user
      end
    end
  end

  factory :authentication_option do
    association :user
    sequence(:email) {|n| "testuser#{n}@example.com.xx"}
    credential_type AuthenticationOption::EMAIL
    authentication_id {User.hash_email email}

    factory :google_authentication_option do
      credential_type AuthenticationOption::GOOGLE
    end

    factory :facebook_authentication_option do
      credential_type AuthenticationOption::FACEBOOK
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

    factory :sublevel do
      sequence(:name) {|n| "sub_level_#{n}"}
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
    after(:create) do |level|
      level.properties['markdown'] = 'lorem ipsum'
      level.save!
    end
  end

  factory :external_link, parent: :level, class: ExternalLink do
    game {Game.external_link}
    url nil
    link_title 'title'
  end

  factory :curriculum_reference, parent: :level, class: CurriculumReference do
    game {Game.curriculum_reference}
  end

  factory :block do
    transient do
      sequence(:index)
    end
    name {"gamelab_block#{index}"}
    category 'custom'
    pool 'fakeLevelType'
    config do
      {
        func: "block#{index}",
        args: [{name: 'ARG'}],
      }.to_json
    end
    helper_code {"function block#{index}() {}"}
  end

  factory :shared_blockly_function do
    transient do
      sequence(:index)
    end
    name {"doing_something#{index}"}
    level_type 'fakeLevelType'
    block_type 'function'
    description 'This does >>something<< interesting!'
    arguments '{"this sprite": "Sprite"}'
    stack '<block type="implementationBlock"></block>'
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

  factory :assessment_activity do
    user
    script
    level
    level_source {create :level_source, level: level}
  end

  factory :script do
    sequence(:name) {|n| "bogus-script-#{n}"}

    factory :csf_script do
      after(:create) do |csf_script|
        csf_script.curriculum_umbrella = 'CSF'
        csf_script.save
      end
    end

    factory :csd_script do
      after(:create) do |csd_script|
        csd_script.curriculum_umbrella = 'CSD'
        csd_script.save
      end
    end

    factory :csp_script do
      after(:create) do |csp_script|
        csp_script.curriculum_umbrella = 'CSP'
        csp_script.save
      end
    end
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

    factory :csf_script_level do
      after(:create) do |csf_script_level|
        csf_script_level.script.curriculum_umbrella = 'CSF'
        csf_script_level.save
      end
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
      after(:create) do |concept|
        video = create(:video)
        concept.video_key = video.key
        concept.save!
      end
    end
  end

  factory :video do
    sequence(:key) {|n| "concept_#{n}"}
    youtube_code 'Bogus text'
    download 'https://videos.code.org/test-video.mp4'
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

  factory :user_school_info do
    user {create :teacher}
    start_date DateTime.now
    last_confirmation_date DateTime.now
    association :school_info
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

    trait :reviewed do
      reviewer {create :teacher}
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

    # create real sublevels, and update pages to match.
    trait :with_sublevels do
      after(:create) do |lg|
        sublevels = [create(:sublevel), create(:sublevel), create(:sublevel)]
        lg.properties['pages'] = [
          {levels: [sublevels[0].name, sublevels[1].name]},
          {levels: [sublevels[2].name]}
        ]
      end
    end
  end

  factory :bubble_choice_level, class: BubbleChoice do
    game {create(:game, app: "bubble_choice")}
    name 'name'
    display_name 'display_name'
    transient do
      sublevels []
    end
    properties do
      {
        display_name: display_name,
        sublevels: sublevels.pluck(:name)
      }
    end

    trait :with_sublevels do
      after(:create) do |bc|
        sublevels = create_list(:level, 3)
        bc.properties['sublevels'] = sublevels.pluck(:name)
        bc.save!
      end
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

  factory :authored_hint_view_request do
    user {create :student}
    script {create :script}
    level {create :level}
    prev_level_source_id {create(:level_source).id}
    next_level_source_id {create(:level_source).id}
    final_level_source_id {create(:level_source).id}
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
    id {(SchoolDistrict.maximum(:id) || 0) + 1}

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
    id {(School.maximum(:id).next).to_s}
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
    group 1
  end

  factory :regional_partner_with_summer_workshops, parent: :regional_partner do
    sequence(:name) {|n| "Partner#{n}"}
    contact_name "Contact Name"
    contact_email "contact@code.org"
    group 1
    apps_open_date_csp_teacher {(Date.current - 1.day).strftime("%Y-%m-%d")}
    apps_open_date_csd_teacher {(Date.current - 2.days).strftime("%Y-%m-%d")}
    apps_close_date_csp_teacher {(Date.current + 3.days).strftime("%Y-%m-%d")}
    apps_close_date_csd_teacher {(Date.current + 4.days).strftime("%Y-%m-%d")}
    csd_cost 10
    csp_cost 12
    cost_scholarship_information "Additional scholarship information will be here."
    additional_program_information "Additional program information will be here."
    pd_workshops do
      [
        create(
          :summer_workshop,
          location_name: "Training building",
          location_address: "3 Smith Street",
          sessions_from: (Date.current + 3.months)
        )
      ]
    end

    trait :with_apps_priority_deadline_date do
      apps_priority_deadline_date {(Date.current + 5.days).strftime("%Y-%m-%d")}
    end
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
    user {create :teacher}
  end

  factory :circuit_playground_discount_code do
    sequence(:code) {|n| "FAKE#{n}_asdf123"}
    full_discount true
    expiration {Time.now + 30.days}
  end

  factory :seeded_s3_object do
    bucket "Bucket containing object"
    key "Object Key"
    etag "Object etag"
  end

  factory :email_preference do
    email 'test@example.net'
    opt_in false
    ip_address '10.0.0.1'
    source :ACCOUNT_SIGN_UP
  end

  factory :user_geo do
    ip_address '10.0.0.1'

    # Space Needle
    trait :seattle do
      city 'Seattle'
      state 'Washington'
      country 'United States'
      postal_code '98109'
      latitude 47.620470
      longitude (-122.349181)
    end

    # Sydney Opera House
    trait :sydney do
      city 'Sydney'
      state 'New South Wales'
      country 'Australia'
      postal_code '2000'
      latitude (-33.859100)
      longitude 151.200200
    end
  end

  factory :teacher_feedback do
    association :student
    association :teacher
    association :level
    association :script_level
  end
end
