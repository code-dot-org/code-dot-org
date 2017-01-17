# rubocop:disable Metrics/BlockLength
FactoryGirl.allow_class_lookup = false
FactoryGirl.define do
  factory :section_hidden_stage do
    section nil
    stage nil
  end
  factory :paired_user_level do
    driver_user_level {user_level}
    navigator_user_level {user_level}
  end

  factory :studio_person do
  end

  factory :user do
    birthday Date.new(1991, 3, 14)
    sequence(:email) { |n| "testuser#{n}@example.com.xx" }
    password "00secret"
    locale 'en-US'
    sequence(:name) { |n| "User#{n} Codeberg" }
    user_type User::TYPE_STUDENT
    confirmed_at Time.now

    # Child of :user factory, since it's in the `factory :user` block
    factory :admin do
      admin true
    end

    factory :levelbuilder do
      after(:create) do |levelbuilder|
        levelbuilder.permission = UserPermission::LEVELBUILDER
        levelbuilder.save
      end
    end

    factory :teacher do
      user_type User::TYPE_TEACHER
      birthday Date.new(1980, 3, 14)
      admin false
      factory :admin_teacher do
        admin true
      end
      factory :terms_of_service_teacher do
        terms_of_service_version 1
      end
      factory :facilitator do
        name 'Facilitator Person'
        after(:create) do |facilitator|
          facilitator.permission = UserPermission::FACILITATOR
        end
      end
      factory :workshop_organizer do
        name 'Workshop Organizer Person'
        after(:create) do |workshop_organizer|
          workshop_organizer.permission = UserPermission::WORKSHOP_ORGANIZER
        end
      end
      factory :district_contact do
        name 'District Contact Person'
        ops_first_name 'District'
        ops_last_name 'Person'
        admin false
        after(:create) do |district_contact|
          district_contact.permission = UserPermission::DISTRICT_CONTACT
        end
      end
      # Creates a teacher optionally enrolled in a workshop,
      # joined the workshop section,
      # or marked attended on either all (true) or a specified list of workshop sessions.
      factory :pd_workshop_participant do
        transient do
          workshop nil
          enrolled true
          in_section false
          attended false
        end
        after(:create) do |teacher, evaluator|
          raise 'workshop required' unless evaluator.workshop
          create :pd_enrollment, workshop: evaluator.workshop, full_name: teacher.name, email: teacher.email if evaluator.enrolled
          evaluator.workshop.section.add_student teacher if evaluator.in_section
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
      admin false
    end

    factory :young_student do
      user_type User::TYPE_STUDENT
      birthday Time.zone.today - 10.years
    end

    factory :young_student_with_tos_teacher do
      after(:create) do |user|
        section = create(:section, user: create(:terms_of_service_teacher))
        create(:follower, section: section, student_user: user)
      end
    end
  end

  factory :districts_users do
    district nil
    user nil
  end

  factory :section do
    sequence(:name) { |n| "Section #{n}"}
    user { create :teacher }
  end

  factory :game do
    sequence(:name) { |n| "game#{n}.com"}
    app "maze"
  end

  factory :level, class: Blockly do
    sequence(:name) { |n| "Level_#{n}" }
    sequence(:level_num) {|n| "1_2_#{n}" }

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
    properties{{title: 'title', answers: [{text: 'test', correct: true}], questions: [{text: 'test'}], options: {hide_submit: false}}}
  end

  factory :text_match, parent: :level, class: TextMatch do
    game {create(:game, app: "textmatch")}
    properties{{title: 'title', questions: [{text: 'test'}], options: {hide_submit: false}}}
  end

  factory :artist, parent: :level, class: Artist do
  end

  factory :maze, parent: :level, class: :Maze do
    skin 'birds'
  end

  factory :applab, parent: :level, class: Applab do
    game {Game.applab}
  end

  factory :free_response, parent: :level, class: FreeResponse do
    game {Game.free_response}
  end

  factory :playlab, parent: :level, class: Studio do
    game {create(:game, app: Game::PLAYLAB)}
  end

  factory :makerlab, parent: :level, class: Applab do
    game {Game.applab}
    properties{{makerlab_enabled: true}}
  end

  factory :gamelab, parent: :level, class: Gamelab do
    game {Game.gamelab}
  end

  factory :multi, parent: :level, class: Applab do
    game {create(:game, app: "multi")}
    properties {
      {
        question: 'question text',
        answers: [
          {text: 'answer1', correct: true},
          {text: 'answer2', correct: false},
          {text: 'answer3', correct: false},
          {text: 'answer4', correct: false}],
        questions: [
          {text: 'question text'}],
        options: {hide_submit: false}
      }
    }
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

  factory :level_source do
    level
    data '<xml/>'
    md5 { Digest::MD5.hexdigest(data) }
    trait :with_image do
      level { create(:level, game: Game.find_by_app(Game::ARTIST))}
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
    activity { create(:activity, level_source: create(:level_source, :with_image)) }
  end

  factory :script do
    sequence(:name) { |n| "bogus-script-#{n}" }
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
      # If multiple levels are specified, mark all but the first as inactive
      if script_level.levels.length > 1
        props = {}
        script_level.levels[1..-1].each do |level|
          props[level.name] = {active: false}
        end
        props.to_json
      end
    end
  end

  factory :stage do
    sequence(:name) { |n| "Bogus Stage #{n}" }
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
    sequence(:element_id) { |n| "#pageElement#{n}" }
    localization_key 'drag_blocks'
    script_level
  end

  factory :activity do
    level
    user
    level_source
  end

  factory :concept do
    sequence(:name) { |n| "Algorithm #{n}" }
    trait :with_video do
      video
    end
  end

  factory :video do
    sequence(:key) { |n| "concept_#{n}" }
    youtube_code 'Bogus text'
  end

  factory :prize do
    prize_provider
    sequence(:code) { |n| "prize_code_#{n}" }
  end

  factory :prize_provider do
  end

  factory :follower do
    section
    user { section.user }
    student_user { create :student }
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
    sequence(:name) { |n| "District #{n}" }
    location 'Panem'
    contact {create(:district_contact)}
  end

  factory :workshop do
    sequence(:name) { |n| "My Workshop #{n}" }
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
    submitter {create :user}
    reviewer nil
    from_instructor false
    script {create :script}
    level {create :level}
    level_source {create :level_source}
    data "MyText"
    status nil
  end

  factory :plc_enrollment_unit_assignment, class: 'Plc::EnrollmentUnitAssignment' do
    plc_user_course_enrollment nil
    plc_course_unit nil
    status Plc::EnrollmentUnitAssignment::START_BLOCKED
    user nil
  end

  factory :plc_course_unit, class: 'Plc::CourseUnit' do
    plc_course {create(:plc_course)}
    script {create(:script)}
    unit_name "MyString"
    unit_description "MyString"
    unit_order 1
  end

  factory :plc_enrollment_module_assignment, class: 'Plc::EnrollmentModuleAssignment' do
    plc_enrollment_unit_assignment nil
    plc_learning_module nil
    user nil
  end

  factory :plc_user_course_enrollment, class: 'Plc::UserCourseEnrollment' do
    status "MyString"
    plc_course nil
    user nil
  end

  factory :plc_task, class: 'Plc::Task' do
    name "MyString"
    plc_learning_modules []
    after(:create) do |plc_task|
      plc_task.plc_learning_modules.each do |learning_module|
        plc_task.script_level = create(:script_level, stage: learning_module.stage, script: learning_module.plc_course_unit.script, levels: [create(:level)])
      end
    end
  end

  factory :plc_learning_module, class: 'Plc::LearningModule' do
    name "MyString"
    plc_course_unit {create(:plc_course_unit)}
    stage {create(:stage)}
    module_type Plc::LearningModule::CONTENT_MODULE
  end
  factory :plc_course, class: 'Plc::Course' do
    name "MyString"
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
    user { create :teacher }
    kind 'Diversity2016'
    properties {{survey2016_ethnicity_asian: "1"}}
    properties {{survey2016_foodstamps: "3"}}
  end

  factory :hint_view_request do
    user { create :student }
    script { create :script }
    level { create :level }
  end

  factory :level_concept_difficulty do
    level { create :level }
    repeat_loops 2
  end

  factory :user_proficiency do
    user { create :student }
    sequencing_d1_count 1
    repeat_loops_d2_count 2
    repeat_loops_d4_count 3
    conditionals_d5_count 4
  end

  factory :pd_workshop, class: 'Pd::Workshop' do
    association :organizer, factory: :workshop_organizer
    workshop_type Pd::Workshop::TYPES.first
    course Pd::Workshop::COURSES.first
    capacity 10
    transient do
      num_sessions 0
      sessions_from Date.today + 9.hours # Start time of the first session, then one per day after that.
    end
    after(:build) do |workshop, evaluator|
      # Sessions, one per day starting today
      evaluator.num_sessions.times do |i|
        workshop.sessions << build(:pd_session, workshop: workshop, start: evaluator.sessions_from + i.days)
      end
    end
  end

  factory :pd_ended_workshop, parent: :pd_workshop, class: 'Pd::Workshop' do
    num_sessions 1
    association :section
    started_at {Time.zone.now}
    ended_at {Time.zone.now}
  end

  factory :pd_session, class: 'Pd::Session' do
    association :workshop, factory: :pd_workshop
    start {Date.today + 9.hours}
    self.end {start + 6.hours}
  end

  factory :pd_teacher_application, class: 'Pd::TeacherApplication' do
    transient do
      application_hash {build(:pd_teacher_application_hash)}
    end
    association :user, factory: :teacher, strategy: :build
    application {application_hash.to_json}
    primary_email {application_hash['primaryEmail']}
    secondary_email {application_hash['secondaryEmail']}
  end

  # The raw attributes as returned by the teacher application form, and saved in Pd::TeacherApplication.application.
  factory :pd_teacher_application_hash, class: 'Hash' do
    transient do
      association :school, factory: :public_school, strategy: :build
      association :school_district, strategy: :build
    end

    initialize_with do
      {
        school: school.id,
        'school-district' => school_district.id,
        firstName: 'Rubeus',
        lastName: 'Hagrid',
        primaryEmail: 'rubeus@hogwarts.co.uk',
        secondaryEmail: 'rubeus+also@hogwarts.co.uk',
        principalPrefix: 'Mrs.',
        principalFirstName: 'Minerva',
        principalLastName: 'McGonagall',
        principalEmail: 'minerva@hogwarts.co.uk',
        selectedCourse: 'csd',
        phoneNumber: '555-555-5555',
        gradesAtSchool: [10],
        genderIdentity: 'Male',
        grades2016: [7, 8],
        subjects2016: ['Math', 'Care of Magical Creatures'],
        grades2017: [10, 11],
        subjects2017: ['Computer Science', 'Care of Magical Creatures'],
        committedToSummer: 'Yes',
        ableToAttendAssignedSummerWorkshop: 'Yes',
        allStudentsShouldLearn: '4',
        allStudentsCanLearn: '4',
        newApproaches: '4',
        allAboutContent: '4',
        allAboutProgramming: '4',
        csCreativity: '4',
        currentCsOpportunities: ['lunch clubs'],
        whyCsIsImportant: 'robots',
        whatTeachingSteps: 'learn and practice'
      }.stringify_keys
    end
  end

  # school info

  # this is the only factory used for testing the deprecated data formats (without country).
  factory :school_info_without_country, class: SchoolInfo do
    school_type SchoolInfo::SCHOOL_TYPE_PUBLIC
    state 'WA'
    association :school_district
  end

  factory :school_info_non_us, class: SchoolInfo do
    country 'GB'
    school_type SchoolInfo::SCHOOL_TYPE_PUBLIC
    school_name 'Grazebrook'
    full_address '31 West Bank, London, England'
  end

  factory :school_info_us, class: SchoolInfo do
    country 'US'
  end

  # although some US school types behave identically, we keep their factories separate here
  # because the behavior of each school type may diverge over time.

  factory :school_info_us_private, class: SchoolInfo do
    country 'US'
    school_type SchoolInfo::SCHOOL_TYPE_PRIVATE
    state 'NJ'
    zip '08534'
    school_name 'Princeton Day School'
  end

  factory :school_info_us_other, class: SchoolInfo do
    country 'US'
    school_type SchoolInfo::SCHOOL_TYPE_OTHER
    state 'NJ'
    zip '08534'
    school_name 'Princeton Day School'
  end

  factory :school_info_us_public, class: SchoolInfo do
    country 'US'
    school_type SchoolInfo::SCHOOL_TYPE_PUBLIC
    state 'WA'

    trait :with_district do
      association :school_district
    end

    trait :with_school do
      association :school, factory: :public_school
    end
  end

  factory :school_info_us_charter, class: SchoolInfo do
    country 'US'
    school_type SchoolInfo::SCHOOL_TYPE_CHARTER
    state 'WA'

    trait :with_district do
      association :school_district
    end

    trait :with_school do
      association :school, factory: :charter_school
    end
  end

  # end school info

  factory :pd_enrollment, class: 'Pd::Enrollment' do
    association :workshop, factory: :pd_workshop
    sequence(:first_name) { |n| "Participant#{n}" }
    last_name 'Codeberg'
    sequence(:email) { |n| "participant#{n}@example.com.xx" }
    association :school_info, factory: :school_info_without_country
    school 'Example School'
    code {SecureRandom.hex(10)}
  end

  factory :pd_attendance, class: 'Pd::Attendance' do
    association :session, factory: :pd_session
    association :teacher
  end

  factory :pd_attendance_no_account, class: 'Pd::Attendance' do
    association :session, factory: :pd_session
    association :enrollment, factory: :pd_enrollment
  end

  factory :pd_district_payment_term, class: 'Pd::DistrictPaymentTerm' do
    association :school_district
    course Pd::Workshop::COURSES.first
    rate_type Pd::DistrictPaymentTerm::RATE_TYPES.first
    rate 10
  end

  factory :pd_course_facilitator, class: 'Pd::CourseFacilitator' do
    association :facilitator
    course Pd::Workshop::COURSES.first
  end

  factory :professional_learning_partner do
    sequence(:name) { |n| "PLP #{n}" }
    contact {create :teacher}
  end

  factory :school_district do
    name "A school district"
    city "Seattle"
    state "WA"
    zip "98101"
  end

  factory :public_school, class: School do
    # school ids are not auto-assigned, so we have to assign one here
    sequence(:id, 333)
    name "A seattle public school"
    city "Seattle"
    state "WA"
    zip "98122"
    school_type SchoolInfo::SCHOOL_TYPE_PUBLIC
    association :school_district
  end

  factory :charter_school, class: School do
    # school ids are not auto-assigned, so we have to assign one here
    sequence(:id, 333)
    name "A seattle charter school"
    city "Seattle"
    state "WA"
    zip "98122"
    school_type SchoolInfo::SCHOOL_TYPE_CHARTER
    association :school_district
  end
end
# rubocop:enable Metrics/BlockLength
