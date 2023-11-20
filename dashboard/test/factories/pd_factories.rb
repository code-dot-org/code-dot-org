FactoryBot.define do
  # example zip: 35010
  factory :regional_partner_alabama, parent: :regional_partner_with_summer_workshops do
    mappings {[create(:pd_regional_partner_mapping, state: "AL")]}
    cost_scholarship_information {"Some **important** information about scholarships."}
    additional_program_information {"And some _additional_ program information."}
  end

  # example zip: 60415
  factory :regional_partner_illinois, parent: :regional_partner_with_summer_workshops do
    # Link to partner-specific site.
    contact_name {"Illinois Contact"}
    link_to_partner_application {"https://code.org/specific-link"}
    mappings {[create(:pd_regional_partner_mapping, state: "IL")]}
  end

  # example zip: 42001
  factory :regional_partner_kentucky, parent: :regional_partner_with_summer_workshops do
    # Applications are closed.
    apps_open_date_teacher {(Time.zone.today - 6.days).strftime("%Y-%m-%d")}
    apps_close_date_teacher {(Time.zone.today - 3.days).strftime("%Y-%m-%d")}
    mappings {[create(:pd_regional_partner_mapping, state: "KY")]}
  end

  # example zip: 07001
  factory :regional_partner_newjersey, parent: :regional_partner_with_summer_workshops do
    # No contact details, no workshop application dates, and no workshops.
    contact_name {nil}
    contact_email {nil}
    apps_open_date_teacher {nil}
    apps_close_date_teacher {nil}
    mappings {[create(:pd_regional_partner_mapping, state: "NJ")]}
    pd_workshops {[]}
  end

  # example zip: 97202
  factory :regional_partner_oregon, parent: :regional_partner_with_summer_workshops do
    # Opening at a specific date in the future.
    apps_open_date_teacher {(Time.zone.today + 5.days).strftime("%Y-%m-%d")}
    apps_close_date_teacher {(Time.zone.today + 15.days).strftime("%Y-%m-%d")}
    mappings {[create(:pd_regional_partner_mapping, state: "OR")]}
  end

  # example zip: 82001
  factory :regional_partner_wyoming, parent: :regional_partner_with_summer_workshops do
    apps_open_date_teacher {(Time.zone.today + 6.days).strftime("%Y-%m-%d")}
    apps_close_date_teacher {(Time.zone.today + 15.days).strftime("%Y-%m-%d")}
    mappings {[create(:pd_regional_partner_mapping, state: "WY")]}
  end

  # example zip: 90210
  factory :regional_partner_beverly_hills, parent: :regional_partner_with_summer_workshops do
    contact_name {"Beverly Hills Contact"}
    mappings {[create(:pd_regional_partner_mapping, zip_code: "90210", state: nil)]}
  end

  factory :pd_session, class: 'Pd::Session' do
    transient do
      duration_hours {6}
    end
    association :workshop, factory: :workshop
    start {Time.zone.today + 9.hours}
    self.end {start + duration_hours.hours}

    trait :with_assigned_code do
      after :build, &:assign_code
    end
  end

  factory :pd_payment_term, class: 'Pd::PaymentTerm' do
    start_date {Time.zone.today}
    fixed_payment {50}
  end

  factory :pd_teachercon_survey, class: 'Pd::TeacherconSurvey' do
    association :pd_enrollment, factory: :pd_enrollment, strategy: :create

    transient do
      randomized_survey_answers {false}
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
        personalLearningNeedsMet: "Strongly Agree",
        haveIdeasAboutFormative: "Strongly Disagree",
        haveIdeasAboutSummative: "Disagree",
        haveConcreteIdeas: "Slightly Disagree",
        toolsWillHelp: "Slightly Agree",
        learnedEnoughToMoveForward: "Agree",
        feelConfidentUsingMaterials: "Strongly Agree",
        feelConfidentCanHelpStudents: "Agree",
        havePlan: "Slightly Agree",
        feelComfortableLeading: "Slightly Disagree",
        haveLessAnxiety: "Disagree",
        whatHelpedMost: "helped learn most",
        whatDetracted: "detracted",
        receivedClearCommunication: "Strongly Agree",
        venueFeedback: "venue feedback",
        knowWhereToGoForHelp: "Strongly Disagree",
        suitableForMyExperience: "Disagree",
        practicingTeachingHelped: "Slightly Disagree",
        seeingOthersTeachHelped: "Slightly Agree",
        facilitatorsPresentedInformationClearly: "Agree",
        facilitatorsProvidedFeedback: "Strongly Agree",
        feltComfortableAskingQuestions: "Agree",
        morePreparedThanBefore: "Slightly Agree",
        lookForwardToContinuing: "Slightly Disagree",
        partOfCommunity: "Disagree",
        allStudentsShouldTake: "Strongly Disagree",
        wouldRecommend: "Disagree",
        bestPdEver: "Slightly Disagree",
        howMuchParticipated: "A tremendous amount",
        howOftenLostTrackOfTime: "Almost always",
        howHappyAfter: "Extremely happy",
        howExcitedBefore: "Extremely excited",
        facilitatorsDidWell: "facilitators did well",
        facilitatorsCouldImprove: "facilitators could improve",
        likedMost: "liked most",
        wouldChange: "would change",
        givePermissionToQuote: "Yes, I give Code.org permission to quote me and use my name.",
        instructionFocus: "Strongly aligned with A",
        teacherResponsibility: "Strongly aligned with A",
        teacherTime: "Strongly aligned with A",
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
        willTeach: "Yes",
        reasonForAttending: [
          "Personal interest"
        ],
        howHeard: [
          "Email from Code.org"
        ],
        receivedClearCommunication: "Strongly Agree",
        schoolHasTech: "Yes",
        venueFeedback: "feedback about venue",
        howMuchLearned: "A tremendous amount",
        howMotivating: "Extremely motivating",
        howMuchParticipated: "A tremendous amount",
        howOftenTalkAboutIdeasOutside: "Almost always",
        howOftenLostTrackOfTime: "Almost always",
        howExcitedBefore: "Extremely excited",
        overallHowInterested: "Extremely interested",
        morePreparedThanBefore: "Strongly Agree",
        knowWhereToGoForHelp: "Strongly Agree",
        suitableForMyExperience: "Strongly Agree",
        wouldRecommend: "Strongly Agree",
        bestPdEver: "Strongly Agree",
        partOfCommunity: "Strongly Agree",
        thingsYouLiked: "liked most",
        thingsYouWouldChange: "would change",
        anythingElse: "like to tell",
        willingToTalk: "No",
        gender: "Male",
        race: [
          "White"
        ],
        age: "21 - 25",
        yearsTaught: "2",
        gradesTaught: [
          "pre-K"
        ],
        gradesPlanningToTeach: [
          "pre-K"
        ],
        subjectsTaught: [
          "English/Language Arts"
        ]
      }.stringify_keys
    end
  end

  factory :pd_local_summer_workshop_survey, class: 'Pd::LocalSummerWorkshopSurvey' do
    association :pd_enrollment, factory: :pd_enrollment, strategy: :create

    transient do
      randomized_survey_answers {false}
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
        receivedClearCommunication: "Strongly Agree",
        venueFeedback: "venue feedback",
        howMuchLearned: "A tremendous amount",
        howMotivating: "Extremely motivating",
        howMuchParticipated: "A tremendous amount",
        howOftenTalkAboutIdeasOutside: "Almost always",
        howOftenLostTrackOfTime: "Almost always",
        howExcitedBefore: "Extremely excited",
        overallHowInterested: "Extremely interested",
        morePreparedThanBefore: "Strongly Agree",
        knowWhereToGoForHelp: "Strongly Agree",
        suitableForMyExperience: "Strongly Agree",
        wouldRecommend: "Strongly Agree",
        anticipateContinuing: "Strongly Agree",
        confidentCanTeach: "Strongly Agree",
        believeAllStudents: "Strongly Agree",
        bestPdEver: "Strongly Agree",
        partOfCommunity: "Strongly Agree",
        thingsYouLiked: "liked most",
        thingsYouWouldChange: "would change",
        givePermissionToQuote: "Yes, I give Code.org permission to quote me and use my name.",
        race: "White",
        highestEducation: "High school diploma",
        degreeField: "Education",
        yearsTaughtStem: "1",
        yearsTaughtCs: "2",
        haveRequiredLicenses: "Yes",
      }.stringify_keys
    end
  end

  factory :pd_facilitator_teachercon_attendance, class: 'Pd::FacilitatorTeacherconAttendance' do
    association :user, factory: :facilitator, strategy: :create
    tc1_arrive {Date.new(2017, 8, 23)}
    tc1_depart {Date.new(2017, 8, 29)}
  end

  factory :pd_enrollment, class: 'Pd::Enrollment' do
    association :workshop
    sequence(:first_name) {|n| "Participant#{n}"}
    last_name {'Codeberg'}
    email {"participant_#{SecureRandom.hex(10)}@example.com.xx"}
    association :school_info
    code {SecureRandom.hex(10)}

    trait :from_user do
      user {create :teacher}
      full_name {user.name} # sets first_name and last_name
      email {user.email}
    end

    trait :with_attendance do
      after(:create) do |enrollment|
        create_list(:pd_attendance, 1, enrollment: enrollment)
      end
    end
  end

  factory :pd_scholarship_info, class: 'Pd::ScholarshipInfo' do
    association :user, factory: :teacher

    course {Pd::Workshop::COURSE_KEY_MAP[Pd::Workshop::COURSE_CSP]}
    application_year {Pd::SharedApplicationConstants::YEAR_19_20}
    scholarship_status {Pd::ScholarshipInfoConstants::YES_CDO}
  end

  factory :pd_attendance, class: 'Pd::Attendance' do
    association :session, factory: :pd_session
    association :teacher
  end

  factory :pd_attendance_no_account, class: 'Pd::Attendance' do
    association :session, factory: :pd_session
    association :enrollment, factory: :pd_enrollment
  end

  # Creates a teacher optionally enrolled in a workshop,
  # or marked attended on either all (true) or a specified list of workshop sessions.
  factory :pd_workshop_participant, parent: :teacher do
    transient do
      workshop {nil}
      enrolled {true}
      attended {false}
      cdo_scholarship_recipient {false}
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

      scholarship_params = {
        user: teacher,
        course: Pd::Workshop::COURSE_KEY_MAP[evaluator.workshop.course],
        application_year: evaluator.workshop.school_year
      }

      # We have an after_create hook on the enrollment model (see :set_default_scholarship_info)
      # that creates a ScholarshipInfo entry in certain cases (namely, if the enrollment is in a CSF workshop).
      # Skip creating a new ScholarshipInfo entry if one has already been created
      # when the enrollment is created above.
      if evaluator.cdo_scholarship_recipient && Pd::ScholarshipInfo.find_by(scholarship_params).nil?
        create :pd_scholarship_info,
          scholarship_params
      end
    end
  end

  factory :pd_district_payment_term, class: 'Pd::DistrictPaymentTerm' do
    association :school_district
    course {Pd::Workshop::COURSES.first}
    rate_type {Pd::DistrictPaymentTerm::RATE_TYPES.first}
    rate {10}
  end

  factory :pd_course_facilitator, class: 'Pd::CourseFacilitator' do
    association :facilitator
    course {Pd::Workshop::COURSES.first}
  end

  factory :pd_pre_workshop_survey, class: 'Pd::PreWorkshopSurvey' do
    # Always create (never build) the associated Enrollment to guarantee that
    # the through association to workshops will work
    association :pd_enrollment, strategy: :create
  end

  factory :pd_regional_partner_contact, class: 'Pd::RegionalPartnerContact' do
    user {nil}
    regional_partner {nil}
    form_data {build(:pd_regional_partner_contact_hash, :matched).to_json}
  end

  factory :pd_regional_partner_contact_hash, class: 'Hash' do
    initialize_with do
      {
        first_name: 'firstName',
        last_name: 'lastName',
        title: 'Dr.',
        email: 'foo@bar.com',
        role: 'School Administrator',
        job_title: 'title',
        grade_levels: ['High School'],
        school_state: 'NY',
        notes: 'Sample notes to regional partner',
        opt_in: 'Yes'
      }
    end

    trait :matched do
      after(:build) do |hash|
        hash.merge!(
          {
            school_type: 'public',
            school_district_other: false,
            school_district: 'District',
            school_state: 'OH',
            school_zipcode: '45242',
          }
        )
      end
    end
  end

  factory :pd_regional_partner_mini_contact, class: 'Pd::RegionalPartnerMiniContact' do
    user {nil}
    regional_partner {nil}
    form_data {build(:pd_regional_partner_mini_contact_hash).to_json}
  end

  factory :pd_regional_partner_mini_contact_hash, class: 'Hash' do
    initialize_with do
      {
        mini: true,
        name: 'name',
        email: 'foo@bar.com',
        zip: '45242',
        notes: 'Sample notes to regional partner',
        role: 'Teacher',
        grade_levels: %w(K-5 6-8)
      }
    end
  end

  factory :pd_international_opt_in, class: 'Pd::InternationalOptIn' do
    user {nil}
    form_data {nil}
  end

  factory :pd_regional_partner_cohort, class: 'Pd::RegionalPartnerCohort' do
    course {Pd::Workshop::COURSE_CSP}
  end

  factory :pd_regional_partner_mapping, class: 'Pd::RegionalPartnerMapping' do
    association :regional_partner
    state {'WA'}
  end

  ruby_to_js_style_keys = ->(k) {k.to_s.camelize(:lower)}
  factory :form_data_hash, class: 'Hash' do
    initialize_with {attributes.transform_keys(&ruby_to_js_style_keys)}
  end

  # ------- APPLICATIONS ------- #

  # ------- Teacher ------- #

  factory :pd_teacher_application_hash_common, class: 'Hash' do
    country {'United States'}
    first_name {'Severus'}
    last_name {'Snape'}
    alternate_email {'ilovepotions@gmail.com'}
    phone {'5558675309'}
    gender_identity {'Male'}
    race {['Other']}
    street_address {'333 Hogwarts Place'}
    city {'Magic City'}
    state {'Washington'}
    add_attribute(:zip_code) {'98101'}
    principal_role {'Headmaster'}
    principal_first_name {'Albus'}
    principal_last_name {'Dumbledore'}
    principal_title {'Dr.'}
    principal_email {'socks@hogwarts.edu'}
    principal_confirm_email {'socks@hogwarts.edu'}
    principal_phone_number {'5555882300'}
    current_role {'Teacher'}
    previous_yearlong_cdo_pd {['CS in Science']}
    committed {'Yes'}
    willing_to_travel {'Up to 50 miles'}
    agree {'Yes'}

    # Make sure school gets persisted; otherwise we might return a school_id
    # for a school that doesn't exist
    school {create(:school)}

    initialize_with do
      attributes.dup.tap do |hash|
        # School in the form data is meant to be an id, but in the factory it can be provided as a School object
        # In that case, replace it with the id from the associated model
        hash[:school] = hash[:school].id if hash[:school].is_a? School
      end.transform_keys(&ruby_to_js_style_keys)
    end

    trait :with_custom_school do
      school {-1}
      school_name {'Code.org'}
      school_address {'1501 4th Ave'}
      school_city {'Seattle'}
      school_state {'Washington'}
      school_zip_code {'98101'}
      school_type {'Public school'}
    end

    trait :with_no_school do
      school {-1}
    end

    trait :with_multiple_workshops do
      able_to_attend_multiple {['December 11-15, 2017 in Indiana, USA']}

      after(:build) do |hash|
        hash.delete 'ableToAttendSingle'
      end
    end

    pay_fee {Pd::Application::TeacherApplication.options[:pay_fee].first}
    enough_course_hours {Pd::Application::TeacherApplication.options[:enough_course_hours].first}
    completing_on_behalf_of_someone_else {'No'}
    replace_existing {'No, this course will be added to the schedule in addition to an existing computer science course'}

    trait :csp do
      program {Pd::Application::TeacherApplication::PROGRAMS[:csp]}
      csp_which_grades {['11', '12']}
      csp_how_offer {'As an AP course'}
    end

    trait :csd do
      program {Pd::Application::TeacherApplication::PROGRAMS[:csd]}
      csd_which_grades {['6', '7']}
    end

    trait :csa do
      program {Pd::Application::TeacherApplication::PROGRAMS[:csa]}
      csa_which_grades {['11', '12']}
      csa_how_offer {'As an AP course'}
      csa_already_know {'Yes'}
      csa_phone_screen {'Yes'}
    end
  end

  # default to csp
  factory :pd_teacher_application_hash, parent: :pd_teacher_application_hash_common do
    csp
  end

  factory :pd_teacher_application, class: 'Pd::Application::TeacherApplication' do
    association :user, factory: [:teacher, :with_school_info], strategy: :create
    course {'csp'}
    transient do
      form_data_hash {build :pd_teacher_application_hash_common, course.to_sym}
    end
    form_data {form_data_hash.to_json}

    trait :locked do
      after(:create) do |application|
        application.update!(status: 'accepted_not_notified')
        application.lock!
      end
    end
  end

  # ----- Principal ----- #

  factory :pd_principal_approval_application_hash_common, parent: :form_data_hash do
    title {'Dr.'}
    first_name {'Albus'}
    last_name {'Dumbledore'}
    email {'albus@hogwarts.edu'}
    can_email_you {'Yes'}
    confirm_principal {true}

    trait :approved_no do
      do_you_approve {'No'}
    end

    trait :replace_course_yes_csp do
      replace_course {'Yes'}
    end

    trait :replace_course_yes_csd do
      replace_course {'Yes'}
    end

    trait :approved_yes do
      do_you_approve {'Yes'}
      with_approval_fields
    end

    trait :approved_other do
      do_you_approve {'Other:'}
      with_approval_fields
    end

    trait :with_approval_fields do
      school {'Hogwarts Academy of Witchcraft and Wizardry'}
      total_student_enrollment {200}
      free_lunch_percent {'50'}
      white {'16'}
      black {'15'}
      hispanic {'14'}
      asian {'13'}
      pacific_islander {'12'}
      american_indian {'11'}
      other {'10'}
      committed_to_master_schedule {Pd::Application::PrincipalApprovalApplication.options[:committed_to_master_schedule][0]}
      replace_course {Pd::Application::PrincipalApprovalApplication.options[:replace_course][1]}
      understand_fee {'Yes'}
      pay_fee {Pd::Application::PrincipalApprovalApplication.options[:pay_fee][0]}
    end
  end

  # default to do_you_approve: other
  factory :pd_principal_approval_application_hash, parent: :pd_principal_approval_application_hash_common do
    approved_other
  end

  factory :pd_principal_approval_application, class: 'Pd::Application::PrincipalApprovalApplication' do
    association :teacher_application, factory: :pd_teacher_application
    course {'csp'}
    transient do
      approved {'Yes'}
      replace_course {Pd::Application::PrincipalApprovalApplication.options[:replace_course][1]}
      form_data_hash do
        build(
          :pd_principal_approval_application_hash_common,
          "approved_#{approved.downcase}".to_sym,
          course: course,
          replace_course: replace_course
        )
      end
    end
    form_data {form_data_hash.to_json}
  end

  # ----- FiT Weekend ----- #

  factory :pd_workshop_daily_survey, class: 'Pd::WorkshopDailySurvey' do
    form_id {12345}
    submission_id {(Pd::WorkshopDailySurvey.maximum(:submission_id) || 0) + 1}
    association :pd_workshop
    association :user
    day {5}
  end

  factory :pd_workshop_facilitator_daily_survey, class: 'Pd::WorkshopFacilitatorDailySurvey' do
    form_id {12345}
    submission_id {(Pd::WorkshopFacilitatorDailySurvey.maximum(:submission_id) || 0) + 1}
    association :pd_session
    pd_workshop {pd_session.workshop}
    association :user
    association :facilitator
    day {5}
  end

  factory :pd_survey_question, class: 'Pd::SurveyQuestion' do
    form_id {12345}
    questions {'{}'}
  end

  factory :pd_application_email, class: 'Pd::Application::Email' do
    association :application, factory: :pd_teacher_application
    email_type {'confirmation'}
    application_status {'confirmation'}
    to {application.user.email}
  end
end
