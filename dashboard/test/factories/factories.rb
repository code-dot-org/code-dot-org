require 'cdo/activity_constants'

FactoryGirl.allow_class_lookup = false

FactoryGirl.define do
  factory :course_offering do
    sequence(:key, 'a') {|c| "bogus-course-offering-#{c}"}
    sequence(:display_name, 'a') {|c| "bogus-course-offering-#{c}"}
  end

  factory :course_version do
    sequence(:key) {|n| "202#{n - 1}"}
    sequence(:display_name) {|n| "2#{n - 1}-2#{n}"}
    association :course_offering
    with_unit_group

    trait :with_unit_group do
      association(:content_root, factory: :unit_group)
    end

    trait :with_unit do
      association(:content_root, factory: :script, is_course: true)
    end
  end

  factory :unit_group_unit do
  end

  factory :unit_group do
    sequence(:name) {|n| "bogus-course-#{n}"}
    sequence(:family_name) {|n| "bogus-course-#{n}"}
    version_year "1991"
    published_state "beta"
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

  factory :pilot do
    sequence(:name) {|n| "test-pilot-#{n}"}
    sequence(:display_name) {|n| "Test Pilot #{n}"}
    allow_joining_via_url 0
  end

  factory :section_hidden_lesson do
    section
    lesson
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
    email {("#{user_type}_#{SecureRandom.uuid}@code.org")}
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
        google_sso_provider
        password nil
        after(:create) {|user| user.update(admin: true)}
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

      factory :universal_instructor do
        sequence(:name) {|n| "Universal Instructor #{n}"}
        sequence(:email) {|n| "test_universal_instructor_#{n}@example.com.xx"}
        after(:create) do |universal_instructor|
          universal_instructor.permission = UserPermission::UNIVERSAL_INSTRUCTOR
        end
      end

      factory :district_contact do
        name 'District Contact Person'
        ops_first_name 'District'
        ops_last_name 'Person'
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

      # We added validation to user accounts and some time which required
      # teacher accounts to have emails. However, there were already existing
      # teacher accounts which didn't have an email. Some of these have not yet
      # been updated, so we need to make sure our system can handle them
      # gracefully.
      # FND-1130: This trait will no longer be required
      trait :before_email_validation do
        after(:create) do |user|
          # Account created one day before the requirements were added.
          user.created_at = User::DATE_TEACHER_EMAIL_REQUIREMENT_ADDED - 1
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

    # We have some tests which want to create student accounts which don't have any authentication setup.
    # Using this will put the user into an invalid state.
    trait :without_encrypted_password do
      after(:create) do |user|
        user.encrypted_password = nil
        user.password = nil
        user.save validate: false
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

    trait :microsoft_v2_sso_provider do
      sso_provider_with_token
      provider 'microsoft_v2_auth'
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
          authentication_id: SecureRandom.uuid,
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
          authentication_id: SecureRandom.uuid,
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
    authentication_id SecureRandom.uuid

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
    participant_type 'student'

    initialize_with {Section.new(attributes)}
  end

  factory :game do
    sequence(:name) {|n| "game#{n}.com"}
    app "maze"
  end

  factory :level, class: Blockly do
    sequence(:name) {|n| "Level_#{n}"}
    level_num 'custom'

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

    trait :with_example_solutions do
      after(:create) do |level|
        level.examples = ['example-1', 'example-2']
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

    trait :with_script do
      after :create do |level|
        script_level = create(:script_level, levels: [level])
        create(:lesson_group, lessons: [script_level.lesson], script: script_level.script)
      end
    end

    factory :sublevel do
      sequence(:name) {|n| "sub_level_#{n}"}
    end
  end

  factory :deprecated_blockly_level, parent: :level do
    sequence(:level_num) {|n| "1_2_#{n}"}
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
    game {Game.bounce}
  end

  factory :odometer, parent: :level, class: Odometer do
    game {Game.odometer}
    level_num 'custom'
  end

  factory :artist, parent: :level, class: Artist do
    game {Game.custom_artist}
  end

  factory :maze, parent: :level, class: :Maze do
    skin 'birds'
  end

  factory :applab, parent: :level, class: Applab do
    game {Game.applab}
    level_num 'custom'

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
    level_num 'custom'
  end

  factory :playlab, parent: :level, class: Studio do
    game {create(:game, app: Game::PLAYLAB)}
    level_num 'custom'
  end

  factory :gamelab, parent: :level, class: Gamelab do
    game {Game.gamelab}
    level_num 'custom'
  end

  factory :weblab, parent: :level, class: Weblab do
    game {Game.weblab}
    level_num 'custom'
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

  factory :javalab, parent: :level, class: Javalab do
    game {Game.javalab}
    level_num 'custom'

    trait :with_example_solutions do
      after(:create) do |level|
        level.examples = ['https://studio.code.org/s/csa-examples/lessons/1/levels/1/']
        level.save!
      end
    end
  end

  factory :spritelab, parent: :level, class: GamelabJr do
    game {Game.spritelab}
    level_num 'custom'
  end

  factory :dance, parent: :level, class: Dancelab do
    game {Game.dance}
    level_num 'custom'
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

  factory :assessment_activity do
    user
    script
    level
    level_source {create :level_source, level: level}
  end

  factory :script, aliases: [:unit] do
    sequence(:name) {|n| "bogus-script-#{n}"}
    published_state "beta"
    is_migrated true
    instruction_type "teacher_led"
    participant_audience "student"
    instructor_audience "teacher"

    trait :with_lessons do
      transient do
        lessons_count 2
      end

      after(:create) do |script, evaluator|
        lesson_group = create :lesson_group, script: script
        evaluator.lessons_count.times do
          create :lesson, :with_activity_section, lesson_group: lesson_group
        end
      end
    end

    trait :with_levels do
      transient do
        lessons_count 1
        levels_count 2
      end

      after(:create) do |script, evaluator|
        lesson_group = create :lesson_group, script: script
        evaluator.lessons_count.times do
          lesson = create :lesson, :with_activity_section, lesson_group: lesson_group
          evaluator.levels_count.times do
            level = create(:level)
            create :script_level, levels: [level], activity_section: lesson.activity_sections.first
          end
        end
      end
    end

    factory :csf_script do
      after(:create) do |csf_script|
        csf_script.curriculum_umbrella = SharedCourseConstants::CURRICULUM_UMBRELLA.CSF
        csf_script.save
      end
    end

    factory :csd_script do
      after(:create) do |csd_script|
        csd_script.curriculum_umbrella = SharedCourseConstants::CURRICULUM_UMBRELLA.CSD
        csd_script.save
      end
    end

    factory :csp_script do
      after(:create) do |csp_script|
        csp_script.curriculum_umbrella = SharedCourseConstants::CURRICULUM_UMBRELLA.CSP
        csp_script.save
      end
    end

    factory :csa_script do
      after(:create) do |csa_script|
        csa_script.curriculum_umbrella = SharedCourseConstants::CURRICULUM_UMBRELLA.CSA
        csa_script.save
      end
    end

    factory :csc_script do
      after(:create) do |csc_script|
        csc_script.curriculum_umbrella = SharedCourseConstants::CURRICULUM_UMBRELLA.CSC
        csc_script.save
      end
    end

    factory :hoc_script do
      after(:create) do |hoc_script|
        hoc_script.curriculum_umbrella = SharedCourseConstants::CURRICULUM_UMBRELLA.HOC
        hoc_script.save
      end
    end
  end

  factory :featured_project do
    storage_app_id {456}
  end

  factory :user_ml_model do
    user
    model_id {SecureRandom.alphanumeric(12)}
    name {"Model name #{Random.rand(111..999)}"}
    metadata '{ "description": "Model details" }'
  end

  factory :script_level do
    script do |script_level|
      script_level.activity_section&.lesson&.script || script_level.lesson&.script || create(:script)
    end

    trait :assessment do
      assessment true
    end

    lesson do |script_level|
      script_level.activity_section&.lesson || create(:lesson)
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
      (script_level.lesson.script_levels.maximum(:position) || 0) + 1 if script_level.lesson
    end

    activity_section_position do |script_level|
      section = script_level.activity_section
      next nil unless section
      (section.script_levels.maximum(:activity_section_position) || 0) + 1
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

  factory :lesson_group do
    sequence(:key) {|n| "Bogus Lesson Group #{n}"}
    display_name(&:key)
    script

    position do |lesson_group|
      (lesson_group.script.lesson_groups.maximum(:position) || 0) + 1
    end
  end

  factory :lesson do
    sequence(:name) {|n| "Bogus Lesson #{n}"}
    sequence(:key) {|n| "Bogus-Lesson-#{n}"}
    has_lesson_plan false
    script do |lesson|
      lesson.lesson_group&.script || create(:script)
    end

    absolute_position do |lesson|
      (lesson.script.lessons.maximum(:absolute_position) || 0) + 1
    end

    # relative_position is actually the same as absolute_position in our factory
    # i.e. it doesn't try to count lockable lessons without lesson plans separately
    # from all other lessons, which is what we normally do for relative position.
    relative_position do |lesson|
      ((lesson.script.lessons.maximum(:absolute_position) || 0) + 1).to_s
    end

    trait :with_activity_section do
      after(:create) do |lesson|
        activity = create :lesson_activity, lesson: lesson
        create :activity_section, lesson_activity: activity
      end
    end
  end

  factory :resource do
    association :course_version
    url 'fake.url'
    name 'fake name'
  end

  factory :objective do
    sequence(:key) {|n| "objective-#{n}"}
    description 'fake description'
  end

  factory :vocabulary do
    association :course_version
    sequence(:key, 'a') {|char| "vocab_#{char}"}
    word 'word'
    definition 'definition'
  end

  factory :programming_environment do
    sequence(:name) {|n| "programming-environment-#{n}"}
  end

  factory :programming_expression do
    association :programming_environment
    sequence(:name) {|n| "programming expression #{n}"}
    sequence(:key) {|n| "programming-expression-#{n}"}
  end

  factory :callout do
    sequence(:element_id) {|n| "#pageElement#{n}"}
    localization_key 'drag_blocks'
    script_level
  end

  factory :lesson_activity do
    sequence(:key) {|n| "lesson-activity-#{n}"}
    sequence(:position)
    lesson
  end

  factory :activity_section do
    sequence(:key) {|n| "activity-section-#{n}"}
    sequence(:position)
    lesson_activity
  end

  factory :activity do
    level
    user
    level_source {create :level_source, level: level}
  end

  factory :framework do
    sequence(:shortcode) {|n| "framework-#{n}"}
    sequence(:name) {|n| "Framework #{n}"}
  end

  factory :standard_category do
    sequence(:shortcode) {|n| "category-#{n}"}
    sequence(:description) {|n| "fake category description #{n}"}
    category_type 'fake category type'
  end

  factory :standard do
    framework
    sequence(:shortcode) {|n| "standard-#{n}"}
    sequence(:description) {|n| "fake description #{n}"}

    trait :with_category do
      after(:create) do |s|
        s.category = create :standard_category, framework: s.framework
      end
    end
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
    script {create :script, published_state: SharedCourseConstants::PUBLISHED_STATE.stable}
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
        levels_and_texts_by_page = [[create(:sublevel), create(:sublevel)], [create(:sublevel)]]
        lg.update_levels_and_texts_by_page(levels_and_texts_by_page)
      end
    end
  end

  factory :bubble_choice_level, class: BubbleChoice do
    game {create(:game, app: "bubble_choice")}
    sequence(:name) {|n| "Bubble_Choice_Level_#{n}"}
    display_name 'display_name'
    properties do
      {
        display_name: display_name,
      }
    end

    # Allow passing a list of levels in the create method to automatically set
    # up sublevels
    transient do
      sublevels []
    end

    after(:create) do |bubble_choice, evaluator|
      bubble_choice.setup_sublevels(evaluator.sublevels.pluck(:name)) if evaluator.sublevels.present?
    end

    # Also allow specifying a trait to automatically create sublevels
    trait :with_sublevels do
      sublevels {create_list(:level, 3)}
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

    # Schools eligible for circuit playground discount codes
    # are schools where over 50% of students are eligible
    # for free and reduced meals.
    trait :is_maker_high_needs_school do
      frl_eligible_total 51
      students_total 100
    end
  end

  # Default school to public school. More specific factories below
  factory :school, parent: :public_school

  factory :school_common, class: School do
    # school ids are not auto-assigned, so we have to assign one here
    id {((School.maximum(:id) || 0).next).to_s}
    address_line1 "123 Sample St"
    address_line2 "attn: Main Office"
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

    trait :is_maker_high_needs_school do
      after(:create) do |school|
        create :school_stats_by_year, :is_maker_high_needs_school, school: school
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
    pl_programs_offered ['CSD', 'CSP']
  end

  factory :regional_partner_with_mappings, parent: :regional_partner do
    sequence(:name) {|n| "Partner#{n}"}
    group 1
    mappings do
      [
        create(
          :pd_regional_partner_mapping,
          zip_code: 98143,
          state: nil
        )
      ]
    end
  end

  factory :regional_partner_with_summer_workshops, parent: :regional_partner do
    sequence(:name) {|n| "Partner#{n}"}
    contact_name "Contact Name"
    contact_email "contact@code.org"
    group 1
    apps_open_date_teacher {(Date.current - 2.days).strftime("%Y-%m-%d")}
    apps_close_date_teacher {(Date.current + 3.days).strftime("%Y-%m-%d")}
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
    association :level
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
    association :script

    trait :with_script_level do
      after(:build) do |tf|
        create :script_level, script: tf.script, levels: [tf.level]
      end
    end
  end

  factory :code_review_comment do
    association :commenter, factory: :student
    association :project_owner, factory: :student

    storage_app_id 1
    comment 'a comment about your project'
  end

  factory :code_review_group do
    sequence(:name) {|n| "group_name_#{n}"}
    association :section
  end

  factory :code_review_group_member do
    association :follower
    association :code_review_group
  end

  factory :reviewable_project do
    sequence(:storage_app_id)
    association :user, factory: :student
    association :level
    association :script
  end

  factory :teacher_score do
    association :user_level
    association :teacher
  end

  factory :donor_school

  factory :contact_rollups_raw do
    sequence(:email) {|n| "contact_#{n}@example.domain"}
    sequence(:sources) {|n| "dashboard.table_#{n}"}
    data {{opt_in: true}}
    data_updated_at {Time.now.utc}
  end

  factory :contact_rollups_processed do
    transient do
      data_updated_at {Time.now.utc}
    end

    sequence(:email) {|n| "contact_#{n}@example.domain"}
    data {{'opt_in' => true}}

    after(:build) do |contact, evaluator|
      contact.data[:updated_at] = evaluator.data_updated_at
    end
  end

  factory :contact_rollups_final do
    sequence(:email) {|n| "contact_#{n}@example.domain"}
    data {{'opt_in' => true}}
  end

  factory :contact_rollups_pardot_memory do
    sequence (:email) {|n| "contact_#{n}@example.domain"}
    sequence(:pardot_id) {|n| n}
    pardot_id_updated_at {Time.now.utc - 1.hour}
    data_synced {{db_Opt_In: 'No'}}
    data_synced_at {Time.now.utc}
  end
end
