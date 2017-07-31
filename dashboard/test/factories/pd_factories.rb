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
          create :pd_teachercon_survey, pd_enrollment: enrollment
        elsif workshop.local_summer?
          create :pd_local_summer_workshop_survey, pd_enrollment: enrollment
        else
          raise 'Num_completed_surveys trait unsupported for this workshop type'
        end
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
    association :user, factory: :facilitator, strategy: :create
    transient do
      form_data {build :pd_facilitator_program_registration_hash, user: user}
    end
    form_data {form_data.to_json}
  end

  # The raw attributes as returned by the teacher application form, and saved in Pd::FacilitatorProgramRegistration.application.
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

  factory :pd_teachercon_survey, class: 'Pd::TeacherconSurvey' do
    association :pd_enrollment, factory: :pd_enrollment, strategy: :create

    after(:build) do |survey|
      if survey.form_data.presence.nil?
        enrollment = survey.pd_enrollment
        workshop = enrollment.workshop

        survey_hash = build :pd_teachercon_survey_hash

        Pd::TeacherconSurvey.facilitator_required_fields.each do |field|
          survey_hash[field] = {}
        end

        survey_hash['whoFacilitated'] = workshop.facilitators.map(&:name)

        workshop.facilitators.each do |facilitator|
          Pd::TeacherconSurvey.facilitator_required_fields.each do |field|
            survey_hash[field][facilitator.name] = 'Free response'
          end
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

  factory :pd_teachercon_survey_randomized_hash, class: 'Hash' do
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

    after(:build) do |survey|
      if survey.form_data.nil?
        enrollment = survey.pd_enrollment
        workshop = enrollment.workshop

        survey_hash = build :pd_local_summer_workshop_survey_hash

        Pd::LocalSummerWorkshopSurvey.facilitator_required_fields.each do |field|
          survey_hash[field] = {}
        end

        survey_hash['whoFacilitated'] = workshop.facilitators.map(&:name)

        workshop.facilitators.each do |facilitator|
          Pd::LocalSummerWorkshopSurvey.facilitator_required_fields.each do |field|
            if Pd::LocalSummerWorkshopSurvey.options.key? field
              survey_hash[field][facilitator.name] = Pd::LocalSummerWorkshopSurvey.options[field].last
            else
              survey_hash[field][facilitator.name] = 'Free Response'
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
    association :school_info, factory: :school_info_without_country
    school 'Example School'
    code {SecureRandom.hex(10)}

    trait :from_user do
      user
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
  end
end
