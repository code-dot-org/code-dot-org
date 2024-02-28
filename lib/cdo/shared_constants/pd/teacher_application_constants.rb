module Pd
  module TeacherApplicationConstants
    YES_NO = %w(Yes No).freeze

    # Remove newlines and leading whitespace from multiline strings
    def self.clean_multiline(string)
      string.gsub(/\n\s*/, ' ')
    end

    PRINCIPAL_APPROVAL_STATE = {
      not_required: 'Not required',
      in_progress: 'Incomplete - Admin email sent on ',
      complete: 'Complete - '
    }

    SEND_ADMIN_APPROVAL_EMAIL_STATUSES = %w(awaiting_admin_approval).freeze

    YEAR = SharedApplicationConstants::APPLICATION_CURRENT_YEAR

    REGIONAL_PARTNER_DEFAULT_GUARDRAILS = {
      frl_rural: 40,
      frl_not_rural: 50,
      urg: 50
    }

    SECTION_HEADERS = {
      choose_your_program: 'Choose Your Program',
      find_your_region: 'Find Your Region',
      about_you: 'About You',
      additional_demographic_information: 'Additional Demographic Information',
      administrator_information: 'Administrator/School Leader Information',
      implementation_plan: 'Implementation Plan',
      professional_learning_program_requirements: 'Program Requirements and Submission',
      school_stats_and_principal_approval_section: 'Administrator Approval and School Information'
    }

    PAGE_LABELS = {
      choose_your_program: {
        program: clean_multiline(
          "Which professional learning program would you like to participate in for the #{YEAR}
          school year?"
        )
      },
      find_your_region: {
        country: 'Country',
        school: 'School',
        school_name: 'School name',
        school_district_name: 'School district',
        school_address: 'School address',
        school_city: 'School city',
        school_state: 'School state',
        school_zip_code: 'School zip code',
        school_type: 'My school is a'
      },
      about_you: {
        completing_on_behalf_of_someone_else: 'Are you completing this application on behalf of someone else?',
        completing_on_behalf_of_name: 'If yes, please include the full name and role of the teacher and why you are applying on behalf of this teacher.',
        first_name: 'First name',
        last_name: 'Last name',
        account_email: 'Account email',
        alternate_email: 'If you have another email address that you check in the summer months, please enter it here:',
        phone: 'Home or cell phone',
        street_address: 'Home street address',
        city: 'Home city',
        state: 'Home state',
        zip_code: 'Home zip code',
        how_heard: 'How did you hear about this program?'
      },
      additional_demographic_information: {
        current_role: 'What is your current role at your school?',
        previous_yearlong_cdo_pd: clean_multiline(
          "Have you participated in previous yearlong Code.org Professional Learning Programs?
           If so, mark the programs in which you have participated."
        ),
        csa_already_know: 'Have you previously taught CS or have you learned CS yourself?',
        csa_phone_screen: clean_multiline(
          'Are you able to independently write a function (or procedure) with one or more
          parameters and that uses conditional logic, loops, and an array (or list)?'
        ),
        gender_identity: 'Gender identity:',
        race: 'Race or ethnicity:',
      },
      administrator_information: {
        principal_title: "Administrator/School Leader's title",
        principal_first_name: "Administrator/School Leader's first name",
        principal_last_name: "Administrator/School Leader's last name",
        principal_role: "Administrator/School Leader's Role",
        principal_email: "Administrator/School Leader's email address",
        principal_confirm_email: "Confirm Administrator/School Leader's email address",
        principal_phone_number: "Administrator/School Leader's phone number"
      },
      implementation_plan: {
        csd_which_grades: clean_multiline(
          "To which grades does your school plan to offer CS Discoveries in the #{YEAR} school year?
           Please note that the CS Discoveries Professional Learning Program
           is not available for grades K-5. (select all that apply)"
        ),
        csp_which_grades: clean_multiline(
          "To which grades does your school plan to offer CS Principles in the #{YEAR}
          school year? Please note that the CS Principles Professional Learning Program
          is not available for grades K-8. (select all that apply)"
        ),
        csp_how_offer: 'How will you offer CS Principles?',
        csa_which_grades: clean_multiline(
          "To which grades does your school plan to offer CSA in the #{YEAR} school year?
          The Code.org CSA curriculum is recommended for those who have successfully completed
          a first-year high school algebra course AND an introductory programming course.
          (select all that apply)"
        ),
        csa_how_offer: 'How will you offer CSA?',
        enough_course_hours: "Will you have more than {{min hours}} hours with your {{CS program}} section(s)?",
        will_teach: "Are you planning to teach this course in the #{YEAR} school year?"
      },
      professional_learning_program_requirements:
        {
          committed: 'Are you committed to participating in the entire Professional Learning Program?',
          able_to_attend_multiple: 'Your Regional Partner is hosting the following workshop(s). Please indicate which workshops you are able to attend. Select all that apply.',
          pay_fee: 'Will your school or district be able to pay a fee for the program?',
          scholarship_reasons: "Please provide any additional information you'd like to share about why your application should be considered for a scholarship.",
          agree: 'By submitting this application, I agree to share this application, my contact information, and aggregate class information with my local Code.org Regional Partner.'
        },
      school_stats_and_principal_approval_section: {
        title_i_status: 'Title I status',
        rural_status: 'Rural Status',
        school_type: 'School Type',
        school_last_census_status: 'Teaches CS',
        total_student_enrollment: 'Total Student Enrollment',
        free_lunch_percent: 'Percent of students eligible to receive free/reduced lunch',
        underrepresented_minority_percent: 'Percent of students from underrepresented racial and ethnic groups',
        american_indian_or_native_alaskan_percent: 'Percent of student enrollment by race: American Indian or Native Alaskan',
        asian_percent: 'Percent of student enrollment by race: Asian',
        black_or_african_american_percent: 'Percent of student enrollment by race: Black or African American',
        hispanic_or_latino_percent: 'Percent of student enrollment by race: Hispanic or Latino',
        native_hawaiian_or_pacific_islander_percent: 'Percent of student enrollment by race: Native Hawaiian or Pacific Islander',
        white_percent: 'Percent of student enrollment by race: White',
        other_races_percent: 'Percent of student enrollment by race: Other',
        principal_approval: "Do you approve of <Teacher Name> participating in Code.org's #{YEAR} Professional Learning Program?",
      }
    }.freeze

    LABEL_OVERRIDES = {
      program: "Which professional learning program would you like to join for the #{YEAR} school year?",
      enough_course_hours: "Will you have more than {{min hours}} hours with your {{CS program}} section(s)?",
    }.freeze

    CSV_LABELS = {
      teacher: {
        date_applied: "Date Applied",
        date_accepted: "Date Accepted",
        status: "Status",
        meets_criteria: "Meets minimum requirements?",
        meets_scholarship_criteria: "Meets scholarship requirements?",
        friendly_scholarship_status: "Scholarship teacher?",
        regional_partner_name: "Regional Partner",
        application_url: "Link to Application",
        assigned_workshop: "Assigned Workshop",
        friendly_registered_workshop: "Registered for workshop?",
        notes: "General Notes",
        notes_2: "Notes 2",
        notes_3: "Notes 3",
        notes_4: "Notes 4",
        notes_5: "Notes 5",
        alternate_email: "Alternate email",
        school_type: "School type",
        district_name: PAGE_LABELS[:find_your_region][:school_district_name],
        school_city: "School city",
        school_state: "School state",
        school_zip_code: "School zip code",
        current_role: "Current role",
        program: LABEL_OVERRIDES[:program],
        csd_which_grades: "To which grades does your school plan to offer CS Discoveries in the #{YEAR} school year?",
        csp_which_grades: "To which grades does your school plan to offer CS Principles in the #{YEAR} school year?",
        csa_which_grades: "To which grades does your school plan to offer CSA in the #{YEAR} school year?",
        csa_already_know: "Have you previously taught CS or have you learned CS yourself?",
        csa_phone_screen: clean_multiline(
          'Are you able to independently write a function (or procedure) with one or more
          parameters and that uses conditional logic, loops, and an array (or list)?'
        ),
        enough_course_hours: "Will you have more than {{min hours}} hours with your {{CS program}} section(s)?",
        previous_yearlong_cdo_pd: "Have you participated in previous yearlong Code.org Professional Learning Programs?",
        able_to_attend_multiple: "Please indicate which workshops you are able to attend.",
        how_heard: PAGE_LABELS[:about_you][:how_heard] + " (Teacher's response)",
        gender_identity: "Teacher's gender identity",
        race: "Teacher's race",
        principal_approval_url: "Administrator/School Leader Approval Form URL",
        street_address: 'Home street address',
        city: 'Home city',
        state: 'Home state',
      },
      principal: {
        title: PAGE_LABELS[:administrator_information][:principal_title] + " (provided by principal)",
        first_name: PAGE_LABELS[:administrator_information][:principal_first_name] + " (provided by principal)",
        last_name: PAGE_LABELS[:administrator_information][:principal_last_name] + " (provided by principal)",
        role: PAGE_LABELS[:administrator_information][:principal_role] + " (provided by principal)",
        email: PAGE_LABELS[:administrator_information][:principal_email] + " (provided by principal)",
        can_email_you: 'Can we email you about updates to our courses, local opportunities, or other computer science news? (roughly once a month)',
        school_name: PAGE_LABELS[:find_your_region][:school_name] + " (provided by principal)",
        district_name: PAGE_LABELS[:find_your_region][:school_district_name] + " (provided by principal)",
        do_you_approve: "Do you approve of this teacher participating in Code.org's #{YEAR} Professional Learning Program?",
        total_student_enrollment: "Total student enrollment",
        free_lunch_percent: "Percent of students who are eligible to receive free or reduced lunch (Principal's response)",
        underrepresented_minority_percent: "Percent of students from underrepresented racial and ethnic groups (Principal's response)",
        white: "Percent of student enrollment by race - White",
        black: "Percent of student enrollment by race - Black or African American",
        hispanic: "Percent of student enrollment by race - Hispanic or Latino",
        asian: "Percent of student enrollment by race - Asian",
        pacific_islander: "Percent of student enrollment by race - Native Hawaiian or other Pacific Islander",
        american_indian: "Percent of student enrollment by race - American Indian or Native Alaskan",
        other: "Percent of student enrollment by race - Other",
        csp_implementation: "How will you implement CS Principles at your school?",
        csd_implementation: "How will you implement CS Discoveries at your school?",
        csa_implementation: "How will you implement CSA at your school?",
        pay_fee: "If there is a fee for the program, will your teacher or your school be able to pay for the fee?",
        share_ap_scores: "Principal authorizes college board to send AP Scores",
      },
      nces: {
        title_i_status: "Title I status code (NCES data)",
        rural_status: 'Rural Status',
        students_total: "Total student enrollment (NCES data)",
        frl_eligible_total: "Percent of students who are eligible to receive free or reduced lunch (NCES data)",
        urm_percent: "Percent of students from underrepresented racial and ethnic groups (NCES data)",
        student_wh_count: "Percent of student enrollment by race - White (NCES data)",
        student_bl_count: "Percent of student enrollment by race - Black or African American (NCES data)",
        student_hi_count: "Percent of student enrollment by race - Hispanic or Latino (NCES data)",
        student_as_count: "Percent of student enrollment by race - Asian (NCES data)",
        student_hp_count: "Percent of student enrollment by race - Native Hawaiian or other Pacific Islander (NCES data)",
        student_am_count: "Percent of student enrollment by race - American Indian or Native Alaskan (NCES data)",
        student_tr_count: "Percent of student enrollment by race - Two or more races (NCES data)",
      }
    }

    MULTI_ANSWER_QUESTION_FIELDS = {
      school_name: {principal: :principal_school_name},
      district_name: {principal: :principal_school_district},
      principal_first_name: {teacher: :principal_first_name, principal: :principal_response_first_name},
      principal_last_name: {teacher: :principal_last_name, principal: :principal_response_last_name},
      principal_role: {teacher: :principal_role, principal: :principal_response_role},
      principal_email: {teacher: :principal_email, principal: :principal_response_email},

      pay_fee: {teacher: :pay_fee, principal: :principal_pay_fee},

      title_i_status: {stats: :title_i_status},
      rural_status: {stats: :rural_status},
      school_type: {teacher: :school_type, stats: :school_type},
      school_last_census_status: {census: :school_last_census_status},
      total_student_enrollment: {principal: :principal_total_enrollment, stats: :students_total},
      free_lunch_percent: {principal: :principal_free_lunch_percent, stats: :frl_eligible_percent},
      underrepresented_minority_percent: {principal: :principal_underrepresented_minority_percent, stats: :urm_percent},
      american_indian_or_native_alaskan_percent: {principal: :principal_american_indian_or_native_alaskan_percent, stats: :american_indian_alaskan_native_percent},
      asian_percent: {principal: :principal_asian_percent, stats: :asian_percent},
      black_or_african_american_percent: {principal: :principal_black_or_african_american_percent, stats: :black_or_african_american_percent},
      hispanic_or_latino_percent: {principal: :principal_hispanic_or_latino_percent, stats: :hispanic_or_latino_percent},
      native_hawaiian_or_pacific_islander_percent: {principal: :principal_native_hawaiian_or_pacific_islander_percent, stats: :native_hawaiian_or_pacific_islander_percent},
      white_percent: {principal: :principal_white_percent, stats: :white_percent},
      other_races_percent: {principal: :principal_other_percent, stats: :two_or_more_races_percent}
    }

    ALL_LABELS = PAGE_LABELS.values.reduce(:merge).freeze
    ALL_LABELS_WITH_OVERRIDES = ALL_LABELS.map {|k, v| [k, LABEL_OVERRIDES[k] || v]}.to_h.freeze
    ADDITIONAL_KEYS_IN_ANSWERS = MULTI_ANSWER_QUESTION_FIELDS.values.flat_map(&:values).uniq.freeze

    VALID_SCORES = {
      # Minimum requirements
      csd_which_grades: YES_NO,
      csp_which_grades: YES_NO,
      csa_which_grades: YES_NO,
      csa_already_know: YES_NO,
      csa_phone_screen: YES_NO,
      committed: YES_NO,
      enough_course_hours: YES_NO,
      previous_yearlong_cdo_pd: YES_NO,
      principal_approval: YES_NO,
      principal_schedule_confirmed: YES_NO,
      # Scholarship requirements
      free_lunch_percent: YES_NO,
      underrepresented_minority_percent: YES_NO,
      school_last_census_status: YES_NO,
    }

    # Need to explicitly list these for the shared constant generation to work.
    SCOREABLE_QUESTIONS = {
      scholarship_questions: [
        :underrepresented_minority_percent,
        :free_lunch_percent,
        :school_last_census_status,
      ],
      criteria_score_questions_csd: [
        :csd_which_grades,
        :enough_course_hours,
        :committed,
        :previous_yearlong_cdo_pd,
        :principal_approval,
      ],
      criteria_score_questions_csp: [
        :csp_which_grades,
        :enough_course_hours,
        :committed,
        :previous_yearlong_cdo_pd,
        :principal_approval,
      ],
      criteria_score_questions_csa: [
        :csa_already_know,
        :csa_phone_screen,
        :csa_which_grades,
        :enough_course_hours,
        :committed,
        :previous_yearlong_cdo_pd,
        :principal_approval,
      ]
    }

    CSV_COLUMNS = {
      teacher: [
        :date_applied,
        :date_accepted,
        :status,
        :meets_criteria,
        :meets_scholarship_criteria,
        :friendly_scholarship_status,
        :notes,
        :notes_2,
        :notes_3,
        :notes_4,
        :notes_5,
        :first_name,
        :last_name,
        :account_email,
        :alternate_email,
        :school_type,
        :school_name,
        :district_name,
        :school_address,
        :school_city,
        :school_state,
        :school_zip_code,
        :assigned_workshop,
        :friendly_registered_workshop,
        :regional_partner_name,
        :application_url,
        :phone,
        :zip_code,
        :country,
        :principal_role,
        :principal_first_name,
        :principal_last_name,
        :principal_email,
        :principal_confirm_email,
        :principal_phone_number,
        :current_role,
        :completing_on_behalf_of_someone_else,
        :completing_on_behalf_of_name,
        :program,
        :csd_which_grades,
        :csp_which_grades,
        :csp_how_offer,
        :enough_course_hours,
        :previous_yearlong_cdo_pd,
        :committed,
        :able_to_attend_multiple,
        :scholarship_reasons,
        :gender_identity,
        :race,
        :how_heard,
        :principal_approval_url,
        :street_address,
        :city,
        :state,
        :csa_already_know,
        :csa_phone_screen,
        :csa_which_grades,
        :csa_how_offer,
      ],
      principal: [
        :title,
        :first_name,
        :last_name,
        :email,
        :can_email_you,
        :school_name,
        :district_name,
        :do_you_approve,
        :total_student_enrollment,
        :free_lunch_percent,
        :underrepresented_minority_percent,
        :white,
        :black,
        :hispanic,
        :asian,
        :pacific_islander,
        :american_indian,
        :other,
        :csp_implementation,
        :csd_implementation,
        :csa_implementation,
        :share_ap_scores,
      ],
      nces: [
        :title_i_status,
        :rural_status,
        :students_total,
        :frl_eligible_total,
        :urm_percent,
        :student_wh_count,
        :student_bl_count,
        :student_hi_count,
        :student_as_count,
        :student_hp_count,
        :student_am_count,
        :student_tr_count
      ]
    }

    TEXT_FIELDS = {
      other_with_text: 'Other:'.freeze,
      other_please_list: 'Other (Please List):'.freeze,
      other_please_explain: 'Other (Please Explain):'.freeze,
      not_teaching_this_year: "I'm not teaching this year (Please Explain):".freeze,
      not_teaching_next_year: "I'm not teaching next year (Please Explain):".freeze,
      dont_know_if_i_will_teach_explain: "I don't know if I will teach this course (Please Explain):".freeze,
      unable_to_attend: 'I’m not able to attend any of the above workshop dates. (Please Explain):',
      able_to_attend_single: "Yes, I'm able to attend".freeze,
      no_explain: "No (Please Explain):".freeze,
      no_pay_fee: 'No, my school/district would not be able to pay the program fee and I would like to be considered for a scholarship.',
      i_dont_know_explain: "I don't know (Please Explain):",
      not_sure_explain: 'Not sure (Please Explain):'
    }.freeze

    SUBJECTS_TAUGHT_IN_PAST = [
      'CS Fundamentals',
      'CS in Algebra',
      'CS in Science',
      'CS Discoveries',
      'CS Principles (intro or AP-level)',
      'AP CS A',
      'Beauty and Joy of Computing',
      'Code HS',
      'Edhesive',
      'Exploring Computer Science',
      'Mobile CSP',
      'NMSI',
      'Project Lead the Way',
      'Robotics',
      'ScratchEd'
    ].freeze

    SUBJECTS_THIS_YEAR = [
      'Computer Science',
      'Computer Literacy',
      'Math',
      'Science',
      'History',
      'Social Studies',
      'English/Language Arts',
      'Music',
      'Art',
      'Multimedia',
      'Foreign Language',
      TEXT_FIELDS[:other_please_list]
    ]
  end
end
