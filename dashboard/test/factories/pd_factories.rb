FactoryGirl.allow_class_lookup = false

FactoryGirl.define do
  factory :pd_workshop, class: 'Pd::Workshop' do
    association :organizer, factory: :workshop_organizer
    on_map true
    funded true
    course Pd::Workshop::COURSES.first
    subject {Pd::Workshop::SUBJECTS[course].try(&:first)}
    trait :teachercon do
      course Pd::Workshop::COURSE_CSP
      subject Pd::Workshop::SUBJECT_CSP_TEACHER_CON
    end
    trait :local_summer_workshop do
      course Pd::Workshop::COURSE_CSP
      subject Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP
    end
    capacity 10
    transient do
      num_sessions 0
      num_facilitators 0
      sessions_from Date.today + 9.hours # Start time of the first session, then one per day after that.
      each_session_hours 6
      num_enrollments 0
      enrolled_and_attending_users 0
      enrolled_unattending_users 0
      num_completed_surveys 0
      randomized_survey_answers false
    end
    after(:build) do |workshop, evaluator|
      # Sessions, one per day starting today
      evaluator.num_sessions.times do |i|
        workshop.sessions << build(
          :pd_session,
          workshop: workshop,
          start: evaluator.sessions_from + i.days,
          duration_hours: evaluator.each_session_hours
        )
      end
      evaluator.num_enrollments.times do
        workshop.enrollments << build(:pd_enrollment, workshop: workshop)
      end
      evaluator.enrolled_and_attending_users.times do
        teacher = create :teacher
        workshop.enrollments << build(:pd_enrollment, workshop: workshop, user: teacher)
        workshop.sessions.each do |session|
          session.attendances << build(:pd_attendance, session: session, teacher: teacher)
        end
      end
      evaluator.enrolled_unattending_users.times do
        teacher = create :teacher
        workshop.enrollments << build(:pd_enrollment, workshop: workshop, user: teacher)
      end
    end

    after(:create) do |workshop, evaluator|
      workshop.sessions.map(&:save)

      evaluator.num_facilitators.times do
        workshop.facilitators << (create :facilitator)
      end

      evaluator.num_completed_surveys.times do
        enrollment = create :pd_enrollment, workshop: workshop
        if workshop.teachercon?
          create :pd_teachercon_survey, pd_enrollment: enrollment, randomized_survey_answers: evaluator.randomized_survey_answers
        elsif workshop.local_summer?
          create :pd_local_summer_workshop_survey, pd_enrollment: enrollment, randomized_survey_answers: evaluator.randomized_survey_answers
        else
          raise 'Num_completed_surveys trait unsupported for this workshop type'
        end
      end
    end
  end

  factory :pd_ended_workshop, parent: :pd_workshop, class: 'Pd::Workshop' do
    num_sessions 1
    started_at {Time.zone.now}
    ended_at {Time.zone.now}
  end

  factory :pd_session, class: 'Pd::Session' do
    transient do
      duration_hours 6
    end
    association :workshop, factory: :pd_workshop
    start {Date.today + 9.hours}
    self.end {start + duration_hours.hours}
  end

  factory :pd_teacher_application, class: 'Pd::TeacherApplication' do
    association :user, factory: :teacher, strategy: :create
    transient do
      application_hash {build :pd_teacher_application_hash, user: user}
    end
    application {application_hash.to_json}
    primary_email {application_hash['primaryEmail']}
    secondary_email {application_hash['secondaryEmail']}
  end

  # The raw attributes as returned by the teacher application form, and saved in Pd::TeacherApplication.application.
  factory :pd_teacher_application_hash, class: 'Hash' do
    transient do
      user nil
      association :school, factory: :public_school, strategy: :build
      association :school_district, strategy: :build
      course 'csd'
    end

    initialize_with do
      {
        school: school.id,
        'school-district' => school_district.id,
        firstName: 'Rubeus',
        lastName: 'Hagrid',
        primaryEmail: user ? user.email : 'rubeus@hogwarts.co.uk',
        secondaryEmail: 'rubeus+also@hogwarts.co.uk',
        principalPrefix: 'Mrs.',
        principalFirstName: 'Minerva',
        principalLastName: 'McGonagall',
        principalEmail: 'minerva@hogwarts.co.uk',
        selectedCourse: course,
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

  factory :pd_payment_term, class: 'Pd::PaymentTerm' do
    start_date {Date.today}
    fixed_payment 50
  end

  factory :pd_facilitator_program_registration, class: 'Pd::FacilitatorProgramRegistration' do
    transient do
      form_data_hash {build :pd_facilitator_program_registration_hash}
    end
    association :user, factory: :facilitator, strategy: :create
    teachercon 1
    form_data {form_data_hash.to_json}
  end

  # The raw attributes as returned by the teacher application form, and saved in Pd::FacilitatorProgramRegistration.form_data.
  factory :pd_facilitator_program_registration_hash, class: 'Hash' do
    initialize_with do
      {
        confirmTeacherconDate: "Yes",
        addressStreet: "123 Main st",
        addressCity: "Anywhere",
        addressState: "AK",
        addressZip: "12345",
        contactName: "Fred",
        contactRelationship: "Imaginary Friend",
        contactPhone: "123-456-7890",
        liveFarAway: "Yes",
        dietaryNeeds: ["Gluten Free"],
        howTraveling: "Flying",
        needHotel: "Yes",
        needAda: "Yes",
        photoRelease: ["Yes"],
        gender: "Female",
        race: ["Hispanic or Latino"],
        age: "26-30",
        yearsTaught: "1",
        gradesTaught: ["Middle School/Junior High"],
        gradesPlanningToTeach: ["Middle School/Junior High"],
        subjectsTaught: ["Science"],
        csYearsTaught: "1",
        liabilityWaiver: ["Yes"]
      }.stringify_keys
    end
  end

  factory :pd_regional_partner_program_registration, class: 'Pd::RegionalPartnerProgramRegistration' do
    transient do
      form_data_hash {build :pd_regional_partner_program_registration_hash}
      regional_partner {create :regional_partner}
    end
    user {regional_partner.contact}
    teachercon 1
    form_data {form_data_hash.to_json}
  end

  factory :pd_regional_partner_program_registration_hash, class: 'Hash' do
    initialize_with do
      {
        confirmTeacherconDate: 'Yes',
        fullName: 'Imaginary RP',
        email: 'rp@example.com',
        contactName: 'Fred',
        contactRelationship: 'Imaginary Friend',
        contactPhone: '123-456-7890',
        dietaryNeeds: ['Gluten Free'],
        liveFarAway: 'Yes',
        howTraveling: 'Flying',
        needHotel: 'Yes',
        needAda: 'Yes',
        photoRelease: ['Yes'],
        liabilityWaiver: ['Yes']
      }.stringify_keys
    end
  end

  factory :pd_teachercon_survey, class: 'Pd::TeacherconSurvey' do
    association :pd_enrollment, factory: :pd_enrollment, strategy: :create

    transient do
      randomized_survey_answers false
    end

    after(:build) do |survey, evaluator|
      if survey.form_data.presence.nil?
        enrollment = survey.pd_enrollment
        workshop = enrollment.workshop

        survey_hash = build :pd_teachercon_survey_hash

        if evaluator.randomized_survey_answers
          survey_hash.each do |k, _|
            survey_hash[k] =
              if Pd::TeacherconSurvey.options.key? k.underscore.to_sym
                Pd::TeacherconSurvey.options[k.underscore.to_sym].sample
              else
                SecureRandom.hex[0..8]
              end
          end
        end

        Pd::TeacherconSurvey.facilitator_required_fields.each do |field|
          survey_hash[field] = {}
        end

        survey_hash['whoFacilitated'] = workshop.facilitators.map(&:name)

        workshop.facilitators.each do |facilitator|
          Pd::TeacherconSurvey.facilitator_required_fields.each do |field|
            if Pd::TeacherconSurvey.options.key? field
              answers = Pd::TeacherconSurvey.options.key? field
              survey_hash[field][facilitator.name] = evaluator.randomized_survey_answers ? answers.sample : answers.last
            else
              survey_hash[field][facilitator.name] = evaluator.randomized_survey_answers ? SecureRandom.hex[0..8] : 'Free Response'
            end
          end
        end

        if Pd::TeacherconSurvey::DISAGREES.include?(survey_hash['personalLearningNeedsMet'])
          survey_hash[:how_could_improve] = evaluator.randomized_survey_answers ? SecureRandom.hex[0..8] : 'Rant about how to improve things'
        end

        survey.update_form_data_hash(survey_hash)
      end
    end
  end

  factory :pd_teachercon_survey_hash, class: 'Hash' do
    initialize_with do
      {
        "personalLearningNeedsMet": "Strongly Agree",
        "haveIdeasAboutFormative": "Strongly Disagree",
        "haveIdeasAboutSummative": "Disagree",
        "haveConcreteIdeas": "Slightly Disagree",
        "toolsWillHelp": "Slightly Agree",
        "learnedEnoughToMoveForward": "Agree",
        "feelConfidentUsingMaterials": "Strongly Agree",
        "feelConfidentCanHelpStudents": "Agree",
        "havePlan": "Slightly Agree",
        "feelComfortableLeading": "Slightly Disagree",
        "haveLessAnxiety": "Disagree",
        "whatHelpedMost": "helped learn most",
        "whatDetracted": "detracted",
        "receivedClearCommunication": "Strongly Agree",
        "venueFeedback": "venue feedback",
        "knowWhereToGoForHelp": "Strongly Disagree",
        "suitableForMyExperience": "Disagree",
        "practicingTeachingHelped": "Slightly Disagree",
        "seeingOthersTeachHelped": "Slightly Agree",
        "facilitatorsPresentedInformationClearly": "Agree",
        "facilitatorsProvidedFeedback": "Strongly Agree",
        "feltComfortableAskingQuestions": "Agree",
        "morePreparedThanBefore": "Slightly Agree",
        "lookForwardToContinuing": "Slightly Disagree",
        "partOfCommunity": "Disagree",
        "allStudentsShouldTake": "Strongly Disagree",
        "wouldRecommend": "Disagree",
        "bestPdEver": "Slightly Disagree",
        "howMuchParticipated": "A tremendous amount",
        "howOftenLostTrackOfTime": "Almost always",
        "howHappyAfter": "Extremely happy",
        "howExcitedBefore": "Extremely excited",
        "facilitatorsDidWell": "facilitators did well",
        "facilitatorsCouldImprove": "facilitators could improve",
        "likedMost": "liked most",
        "wouldChange": "would change",
        "givePermissionToQuote": "Yes, I give Code.org permission to quote me and use my name.",
        "instructionFocus": "Strongly aligned with A",
        "teacherResponsibility": "Strongly aligned with A",
        "teacherTime": "Strongly aligned with A",
      }.stringify_keys
    end
  end

  factory :pd_workshop_survey, class: 'Pd::WorkshopSurvey' do
    transient do
      form_data_hash {build :pd_workshop_survey_hash}
    end
    association :pd_enrollment, factory: :pd_enrollment, strategy: :create
    form_data {form_data_hash.to_json}
  end

  factory :pd_workshop_survey_hash, class: 'Hash' do
    initialize_with do
      {
        "willTeach": "Yes",
        "reasonForAttending": [
          "Personal interest"
        ],
        "howHeard": [
          "Email from Code.org"
        ],
        "receivedClearCommunication": "Strongly Agree",
        "schoolHasTech": "Yes",
        "venueFeedback": "feedback about venue",
        "howMuchLearned": "A tremendous amount",
        "howMotivating": "Extremely motivating",
        "howMuchParticipated": "A tremendous amount",
        "howOftenTalkAboutIdeasOutside": "Almost always",
        "howOftenLostTrackOfTime": "Almost always",
        "howExcitedBefore": "Extremely excited",
        "overallHowInterested": "Extremely interested",
        "morePreparedThanBefore": "Strongly Agree",
        "knowWhereToGoForHelp": "Strongly Agree",
        "suitableForMyExperience": "Strongly Agree",
        "wouldRecommend": "Strongly Agree",
        "bestPdEver": "Strongly Agree",
        "partOfCommunity": "Strongly Agree",
        "thingsYouLiked": "liked most",
        "thingsYouWouldChange": "would change",
        "anythingElse": "like to tell",
        "willingToTalk": "No",
        "gender": "Male",
        "race": [
          "White"
        ],
        "age": "21 - 25",
        "yearsTaught": "2",
        "gradesTaught": [
          "pre-K"
        ],
        "gradesPlanningToTeach": [
          "pre-K"
        ],
        "subjectsTaught": [
          "English\/Language Arts"
        ]
      }.stringify_keys
    end
  end

  factory :pd_local_summer_workshop_survey, class: 'Pd::LocalSummerWorkshopSurvey' do
    association :pd_enrollment, factory: :pd_enrollment, strategy: :create

    transient do
      randomized_survey_answers false
    end

    after(:build) do |survey, evaluator|
      if survey.form_data.nil?
        enrollment = survey.pd_enrollment
        workshop = enrollment.workshop

        survey_hash = build :pd_local_summer_workshop_survey_hash

        if evaluator.randomized_survey_answers
          survey_hash.each do |k, _|
            survey_hash[k] =
              if Pd::LocalSummerWorkshopSurvey.options.key? k.underscore.to_sym
                Pd::LocalSummerWorkshopSurvey.options[k.underscore.to_sym].sample
              else
                SecureRandom.hex[0..8]
              end
          end
        end

        Pd::LocalSummerWorkshopSurvey.facilitator_required_fields.each do |field|
          survey_hash[field] = {}
        end

        survey_hash['whoFacilitated'] = workshop.facilitators.map(&:name)

        workshop.facilitators.each do |facilitator|
          Pd::LocalSummerWorkshopSurvey.facilitator_required_fields.each do |field|
            if Pd::LocalSummerWorkshopSurvey.options.key? field
              answers = Pd::LocalSummerWorkshopSurvey.options[field]
              survey_hash[field][facilitator.name] = evaluator.randomized_survey_answers ? answers.sample : answers.last
            else
              survey_hash[field][facilitator.name] = evaluator.randomized_survey_answers ? SecureRandom.hex[0..8] : 'Free Response'
            end
          end
        end

        survey.update_form_data_hash(survey_hash)
      end
    end
  end

  factory :pd_local_summer_workshop_survey_hash, class: 'Hash' do
    initialize_with do
      {
        "receivedClearCommunication": "Strongly Agree",
        "venueFeedback": "venue feedback",
        "howMuchLearned": "A tremendous amount",
        "howMotivating": "Extremely motivating",
        "howMuchParticipated": "A tremendous amount",
        "howOftenTalkAboutIdeasOutside": "Almost always",
        "howOftenLostTrackOfTime": "Almost always",
        "howExcitedBefore": "Extremely excited",
        "overallHowInterested": "Extremely interested",
        "morePreparedThanBefore": "Strongly Agree",
        "knowWhereToGoForHelp": "Strongly Agree",
        "suitableForMyExperience": "Strongly Agree",
        "wouldRecommend": "Strongly Agree",
        "anticipateContinuing": "Strongly Agree",
        "confidentCanTeach": "Strongly Agree",
        "believeAllStudents": "Strongly Agree",
        "bestPdEver": "Strongly Agree",
        "partOfCommunity": "Strongly Agree",
        "thingsYouLiked": "liked most",
        "thingsYouWouldChange": "would change",
        "givePermissionToQuote": "Yes, I give Code.org permission to quote me and use my name.",
        "race": "White",
        "highestEducation": "High school diploma",
        "degreeField": "Education",
        "yearsTaughtStem": "1",
        "yearsTaughtCs": "2",
        "haveRequiredLicenses": "Yes",
      }.stringify_keys
    end
  end

  factory :pd_accepted_program, class: 'Pd::AcceptedProgram' do
    workshop_name '2017: workshop'
    course 'csd'
    association :user, factory: :teacher, strategy: :create
    association :teacher_application, factory: :pd_teacher_application, strategy: :create
  end

  factory :pd_facilitator_teachercon_attendance, class: 'Pd::FacilitatorTeacherconAttendance' do
    association :user, factory: :facilitator, strategy: :create
    tc1_arrive Date.new(2017, 8, 23)
    tc1_depart Date.new(2017, 8, 29)
  end

  factory :pd_enrollment, class: 'Pd::Enrollment' do
    association :workshop, factory: :pd_workshop
    sequence(:first_name) {|n| "Participant#{n}"}
    last_name 'Codeberg'
    sequence(:email) {|n| "participant#{n}@example.com.xx"}
    association :school_info
    code {SecureRandom.hex(10)}

    trait :from_user do
      user {create :teacher}
      full_name {user.name} # sets first_name and last_name
      email {user.email}
    end
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

  factory :pd_workshop_material_order, class: 'Pd::WorkshopMaterialOrder' do
    association :enrollment, factory: :pd_enrollment
    association :user, factory: :teacher
    street '1501 4th Ave'
    apartment_or_suite 'Suite 900'
    city 'Seattle'
    state 'WA'
    add_attribute :zip_code, '98101'
    phone_number '555-111-2222'
    address_override "0"
  end

  factory :pd_pre_workshop_survey, class: 'Pd::PreWorkshopSurvey' do
    association :pd_enrollment
  end

  factory :pd_regional_partner_contact, class: 'Pd::RegionalPartnerContact' do
    user nil
    regional_partner nil
    form_data nil
  end

  factory :pd_regional_partner_cohort, class: 'Pd::RegionalPartnerCohort' do
    course Pd::Workshop::COURSE_CSP
  end

  factory :pd_regional_partner_mapping, class: 'Pd::RegionalPartnerMapping' do
    association :regional_partner
    state 'WA'
  end

  factory :pd_facilitator1819_application_hash, class: 'Hash' do
    transient do
      program Pd::Application::Facilitator1819Application::PROGRAM_OPTIONS.first
      state 'Washington'
      add_attribute :zip_code, '98101'
    end

    initialize_with do
      {
        firstName: 'Rubeus',
        lastName: 'Hagrid',
        phone: '555-555-5555',
        address: '101 Hogwarts Ave',
        city: 'Seattle',
        state: state,
        zipCode: zip_code,
        genderIdentity: 'Male',
        race: ['Other'],
        institutionType: ['Institute of higher education'],
        currentEmployer: 'Gryffindor House',
        jobTitle: 'Keeper of Keys and Grounds of Hogwarts',
        resumeLink: 'linkedin.com/rubeus_hagrid',
        workedInCsJob: 'No',
        completedCsCoursesAndActivities: ['Advanced CS in high school or college'],
        diversityTraining: 'No',
        howHeard: ['Code.org email'],
        program: program,
        planOnTeaching: ['Yes'],
        abilityToMeetRequirements: '4',
        ledCsExtracurriculars: ['Hour of Code'],
        teachingExperience: 'No',
        gradesTaught: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'],
        gradesCurrentlyTeaching: ['Grade 7'],
        subjects_taught: ['Computer Science'],
        yearsExperience: 'None',
        experienceLeading: ['AP CS A', 'Hour of Code'],
        completedPd: ['CS Fundamentals (1 day workshop)'],
        codeOrgFacilitator: 'No',
        haveLedPd: 'Yes',
        groupsLedPd: ['None'],
        describePriorPd: 'PD description',
        whoShouldHaveOpportunity: 'all students',
        howSupportEquity: 'support equity',
        expectedTeacherNeeds: 'teacher needs',
        describeAdaptingLessonPlan: 'adapt lesson plan',
        describeStrategies: 'strategies',
        exampleHowUsedFeedback: 'used feedback',
        exampleHowProvidedFeedback: 'provided feedback',
        hopeToLearn: 'many things',
        availableDuringWeek: 'Yes',
        weeklyAvailability: ['10am ET / 7am PT'],
        travelDistance: 'Within my city',
        additionalInfo: 'none',
        agree: true
      }.tap do |hash|
        if program == Pd::Application::Facilitator1819Application::PROGRAMS[:csf]
          hash[:csfAvailability] = 'Yes'
        else
          hash[:csdCspTeacherconAvailability] = 'TeacherCon 1: June 17 - 22, 2018'
          hash[:csdCspFitAvailability] = 'June 23 - 24, 2018 (immediately following TeacherCon 1)'
        end
      end.stringify_keys
    end

    trait :with_csf_specific_fields do
      after :build do |hash|
        hash['csfAvailability'] = Pd::Application::Facilitator1819Application::ONLY_WEEKEND
        hash['csfPartialAttendanceReason'] = 'reasons'
      end
    end

    trait :with_csd_csp_specific_fields do
      after :build do |hash|
        hash['csdCspFitAvailability'] = Pd::Application::Facilitator1819Application.options[:csd_csp_fit_availability].first
        hash['csdCspTeacherconAvailability'] = Pd::Application::Facilitator1819Application.options[:csd_csp_teachercon_availability].first
      end
    end
  end

  factory :pd_facilitator1819_application, class: 'Pd::Application::Facilitator1819Application' do
    association :user, factory: :teacher, strategy: :create
    course 'csp'
    transient do
      form_data_hash {build :pd_facilitator1819_application_hash, program: Pd::Application::Facilitator1819Application::PROGRAMS[course.to_sym]}
    end
    form_data {form_data_hash.to_json}
  end

  factory :pd_teacher1819_application_hash, class: 'Hash' do
    transient do
      program Pd::Application::Teacher1819Application::PROGRAM_OPTIONS.last
      state 'Washington'
      add_attribute :zip_code, '98101'
      association :school
      principal_title 'Dr.'
    end

    initialize_with do
      {
        country: 'United States',
        title: 'Mr.',
        first_name: 'Severus',
        preferred_first_name: 'Sevvy',
        last_name: 'Snape',
        account_meail: 'severus@hogwarts.edu',
        alternate_email: 'ilovepotions@gmail.com',
        phone: '5558675309',
        address: '123 Fake Street',
        city: 'Buffalo',
        state: state,
        zip_code: zip_code,
        gender_identity: 'Male',
        race: ['Other'],
        school: school.id,
        principal_first_name: 'Albus',
        principal_last_name: 'Dumbledore',
        principal_title: principal_title,
        principal_email: 'socks@hogwarts.edu',
        principal_confirm_email: 'socks@hogwarts.edu',
        principal_phone_number: '5555882300',
        current_role: 'Teacher',
        program: program,
        grades_at_school: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7'],
        grades_teaching: ['Grade 7'],
        grades_expect_to_teach: ['Grade 6', 'Grade 7'],
        does_school_require_cs_license: 'Yes',
        have_cs_license: 'Yes',
        subjects_teaching: ['Computer Science'],
        subjects_expect_to_teach: ['Computer Science'],
        subjects_licensed_to_teach: ['Computer Science'],
        taught_in_past: ['Hour of Code'],
        previous_yearlong_cdo_pd: ['CS in Science'],
        cs_offered_at_school: ['AP CS A'],
        cs_opportunities_at_school: ['Courses for credit'],
        plan_to_teach: 'Yes, I plan to teach this course',
        able_to_attend_single: 'Yes',
        able_to_attend_multiple: 'Yes',
        committed: 'Yes',
        willing_to_travel: 'More than 50 miles',
        agree: 'Yes'
      }.tap do |hash|
        if program == 'Computer Science Principles (appropriate for 9th - 12th grade, and can be implemented as an AP or introductory course)'
          hash['csp_which_grades'] = ['11', '12']
          hash['csp_course_hours_per_week'] = 'More than 5 course hours per week'
          hash['csp_course_hours_per_year'] = 'At least 100 course hours'
          hash['csp_terms_per_year'] = '1 quarter'
          hash['csp_how_offer'] = 'As an AP course'
          hash['csp_ap_exam'] = 'Yes, all students will be expected to take the AP CS Principles exam'
        else
          hash['csd_which_grades'] = ['6', '7']
          hash['csd_course_hours_per_week'] = '5 or more course hours per week'
          hash['csd_course_hours_per_year'] = 'At least 100 course hours'
          hash['csd_terms_per_year'] = '1 quarter'
        end
      end.stringify_keys
    end
  end

  factory :pd_teacher1819_application, class: 'Pd::Application::Teacher1819Application' do
    association :user, factory: :teacher, strategy: :create
    course 'csp'
    form_data {build(:pd_teacher1819_application_hash, program: Pd::Application::Teacher1819Application::PROGRAMS[course.to_sym]).to_json}
    application_guid nil
    regional_partner nil
  end

  factory :pd_principal_approval1819_application_hash, class: 'Hash' do
    transient do
      approved 'Yes'
      replace_course Pd::Application::PrincipalApproval1819Application.options[:replace_course][1]
      course 'csp'
    end
    initialize_with do
      {
        first_name: 'Albus',
        last_name: 'Dumbledore',
        title: 'Dr.',
        email: 'albus@hogwarts.edu',
        do_you_approve: approved,
        confirm_principal: true
      }.tap do |hash|
        unless approved == Pd::Application::ApplicationBase::NO
          hash.merge! (
            {
              school: 'Hogwarts Academy of Witchcraft and Wizardry',
              total_student_enrollment: 200,
              free_lunch_percent: '50%',
              white: '16%',
              black: '15%',
              hispanic: '14%',
              asian: '13%',
              pacific_islander: '12%',
              american_indian: '11%',
              other: '10%',
              committed_to_master_schedule: 'Yes',
              hours_per_year: 'At least 100 course hours',
              terms_per_year: '1 quarter',
              replace_course: replace_course,
              committed_to_diversity: 'Yes',
              understand_fee: 'Yes',
              pay_fee: 'Yes, my school or my teacher will be able to pay the full summer workshop program fee'
            }
          )

          if replace_course == Pd::Application::ApplicationBase::YES
            if course == 'csp'
              hash[:replace_which_course_csp] = ['Beauty and Joy of Computing']
            elsif course == 'csd'
              hash[:replace_which_course_csd] = ['CodeHS']
            end
          end
        end
      end.stringify_keys
    end
  end

  factory :pd_principal_approval1819_application, class: 'Pd::Application::PrincipalApproval1819Application' do
    association :teacher_application, factory: :pd_teacher1819_application
    transient do
      approved 'Yes'
      replace_course Pd::Application::PrincipalApproval1819Application.options[:replace_course][1]
    end
    course 'csp'
    form_data {build(:pd_principal_approval1819_application_hash, course: course, approved: approved, replace_course: replace_course).to_json}
  end
end
