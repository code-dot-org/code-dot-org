module Pd
  module Teacher2021ApplicationConstants
    YES_NO = %w(Yes No).freeze

    # Remove newlines and leading whitespace from multiline strings
    def self.clean_multiline(string)
      string.gsub(/\n\s*/, ' ')
    end

    SECTION_HEADERS = {
      about_you: 'About You',
      teaching_background: 'Teaching Background',
      choose_your_program: 'Choose Your Program',
      professional_learning_program_requirements: 'Professional Learning Program Requirements',
      additional_demographic_information: 'Additional Demographic Information and Submission',
      school_stats_and_principal_approval_section: 'Principal Approval and School Information'
    }

    PAGE_LABELS = {
      about_you: {
        country: 'Country',
        first_name: 'First name',
        last_name: 'Last name',
        account_email: 'Account email',
        alternate_email: 'If you use another email (especially during summer months), enter it here:',
        phone: 'Home or cell phone',
        gender_identity: 'Gender identity',
        race: 'Race or ethnicity',
        zip_code: 'Home zip code',
        school: 'School',
        school_name: 'School name',
        school_district_name: 'School district',
        school_address: 'School address',
        school_city: 'City',
        school_state: 'State',
        school_zip_code: 'Zip code',
        school_type: 'My school is a',
        principal_title: "Principal's title",
        principal_first_name: "Principal's first name",
        principal_last_name: "Principal's last name",
        principal_email: "Principal's email address",
        principal_confirm_email: "Confirm principal's email address",
        principal_phone_number: "Principal's phone number",
        current_role: 'What is your current role at your school?',
        completing_on_behalf_of_someone_else: 'Are you completing this application on behalf of someone else?',
        completing_on_behalf_of_name: 'If yes, please include the full name and role of the teacher and why you are applying on behalf of this teacher.',
        how_heard: 'How did you hear about this program?'
      },
      teaching_background: {
        previous_yearlong_cdo_pd: clean_multiline(
          "Have you participated in previous yearlong Code.org Professional Learning Programs?
           If so, mark the programs you've participated in."
        )
      },
      choose_your_program: {
        program: clean_multiline(
          'Which professional learning program would you like to join for the 2020-21
          school year? Note: this application is only for Computer Science Discoveries and
          Computer Science Principles. If you are interested in teaching Advanced
          Placement CS A (in Java), visit this
          [AP CS A overview](https://code.org/educate/curriculum/apcsa). Review our
          [guidance documents](https://docs.google.com/document/d/1DhvzoNElJcfGYLrp5sVnnqp0ShvsePUpp3JK7ihjFGM/edit)
          to see whether your course implementation plans meet our program guidelines.'
        ),
        csd_which_grades: clean_multiline(
          'To which grades does your school plan to offer CS Discoveries in the 2020-21 school year?
           Please note that the CS Discoveries Professional Learning Program
           is not available for grades K-5. (select all that apply)'
        ),
        csp_which_grades: clean_multiline(
          'To which grades does your school plan to offer CS Principles in the 2020-21
          school year? Please note that the CS Principles Professional Learning Program
          is not available for grades K-8. (select all that apply)'
        ),
        csp_how_offer: 'How will you offer CS Principles?',
        cs_how_many_minutes: clean_multiline(
          'How many minutes per day is one CS program class section? (Include the
          number of minutes from start to finish that you see your students per class
          period. If it varies from day to day, estimate the average number of minutes
          you meet per class period.)'
        ),
        cs_how_many_days_per_week: 'How many days per week will your CS program class be offered to one section of students?',
        cs_how_many_weeks_per_year: 'How many weeks during the year will this course be taught to one section of students?',
        cs_total_course_hours: 'Computed total course hours',
        csd_which_units: 'Which CS Discoveries units do you intend to teach in the 2020-21 school year?',
        csp_which_units: 'Which CS Principles units do you intend to teach in the 2020-21 school year?',
        plan_to_teach: "Do you plan to personally teach this course in the 2020-21 school year?",
        replace_existing: 'Will this course replace an existing computer science course in the master schedule? If yes, please list the course(s) that will be replaced.',
        replace_which_course: 'Which existing course or curriculum will it replace? Mark all that apply.'
      },
      professional_learning_program_requirements:
        {
          committed: 'Are you committed to participating in the entire Professional Learning Program?',
          able_to_attend_multiple: 'Your Regional Partner is hosting local summer workshop(s) at the following dates and locations. Please indicate which workshops you are able to attend. Select all that apply.',
          travel_to_another_workshop: 'If you are unable to make any of the above workshop dates, would you be open to traveling to another region for your local summer workshop?',
          willing_to_travel: clean_multiline(
            'The four one-day school year workshops are typically held on Saturdays, with an approximate
           schedule of 9am - 4pm. How far would you be willing to travel to each workshop?'
          ),
          interested_in_online_program: 'Do you want to be considered for the virtual academic year workshop track?',
          pay_fee: 'Will your school be able to pay the fee?',
          understand_fee: "By checking this box, you indicate that you understand there may be a fee for the professional learning program you attend.",
          scholarship_reasons: "Please provide any additional information you'd like to share about why your application should be considered for a scholarship."
        },
      additional_demographic_information:
        {
          gender_identity: 'Gender identity:',
          race: 'Race or ethnicity:',
          how_heard: 'How did you hear about this program?',
          agree: 'By submitting this application, I agree to share this application, my contact information, and overall class information with my local Code.org Regional Partner.'
        },
      school_stats_and_principal_approval_section: {
        title_i_status: 'Title I status',
        rural_status: 'Rural Status',
        school_type: 'School Type',
        total_student_enrollment: 'Total Student Enrollment',
        free_lunch_percent: 'Percent of students eligible to receive free/reduced lunch',
        underrepresented_minority_percent: 'Percent of students that are underrepresented minorities',
        american_indian_or_native_alaskan_percent: 'Percentage of student enrollment by race: American Indian or Native Alaskan',
        asian_percent: 'Percentage of student enrollment by race: Asian',
        black_or_african_american_percent: 'Percentage of student enrollment by race: Black or African American',
        hispanic_or_latino_percent: 'Percentage of student enrollment by race: Hispanic or Latino',
        native_hawaiian_or_pacific_islander_percent: 'Percentage of student enrollment by race: Native Hawaiian or Pacific Islander',
        white_percent: 'Percentage of student enrollment by race: White',
        other_races_percent: 'Percentage of student enrollment by race: Other',
        principal_approval: "Do you approve of <Teacher Name> participating in Code.org's 2020-21 Professional Learning Program?",
        principal_schedule_confirmed: 'Are you committed to including Computer Science <Program> on the master schedule in 2020-21 if <Teacher Name> is accepted into the program?',
        principal_diversity_recruitment: 'Do you commit to recruiting and enrolling a diverse group of students in this course, representative of the overall demographics of your school?',
        contact_invoicing: "Contact name for invoicing",
        contact_invoicing_detail: "Contact email or phone number for invoicing",
      }
    }.freeze

    LABEL_OVERRIDES = {
      program: 'Which professional learning program would you like to join for the 2020-21 school year?',
      cs_how_many_minutes: 'How many minutes will your class last?'
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
        district_name: PAGE_LABELS[:about_you][:school_district_name],
        school_city: "School city",
        school_state: "School state",
        school_zip_code: "School zip code",
        current_role: "Current role",
        program: LABEL_OVERRIDES[:program],
        csd_which_grades: "To which grades does your school plan to offer CS Discoveries in the 2020-21 school year?",
        csp_which_grades: "To which grades does your school plan to offer CS Principles in the 2020-21 school year?",
        cs_how_many_minutes: "How many minutes will your CS Program class last?",
        cs_total_course_hours: "Total course hours",
        replace_existing: "Will this course replace an existing computer science course in the master schedule? (Teacher's response)",
        previous_yearlong_cdo_pd: "Have you participated in previous yearlong Code.org Professional Learning Programs?",
        able_to_attend_multiple: "Please indicate which workshops you are able to attend.",
        willing_to_travel: "How far would you be willing to travel to academic year workshops?",
        how_heard: PAGE_LABELS[:additional_demographic_information][:how_heard] + " (Teacher's response)",
        gender_identity: "Teacher's gender identity",
        race: "Teacher's race",
        principal_approval_url: "Principal Approval Form URL"
      },
      principal: {
        title: PAGE_LABELS[:about_you][:principal_title] + " (provided by principal)",
        first_name: PAGE_LABELS[:about_you][:principal_first_name] + " (provided by principal)",
        last_name: PAGE_LABELS[:about_you][:principal_last_name] + " (provided by principal)",
        email: PAGE_LABELS[:about_you][:principal_email] + " (provided by principal)",
        school_name: PAGE_LABELS[:about_you][:school_name] + " (provided by principal)",
        district_name: PAGE_LABELS[:about_you][:school_district_name] + " (provided by principal)",
        do_you_approve: "Do you approve of this teacher participating in Code.org's 2020-21 Professional Learning Program?",
        total_student_enrollment: "Total student enrollment",
        free_lunch_percent: "Percentage of students who are eligible to receive free or reduced lunch (Principal's response)",
        underrepresented_minority_percent: "Percentage of underrepresented minority students (Principal's response)",
        white: "Percentage of student enrollment by race - White",
        black: "Percentage of student enrollment by race - Black or African American",
        hispanic: "Percentage of student enrollment by race - Hispanic or Latino",
        asian: "Percentage of student enrollment by race - Asian",
        pacific_islander: "Percentage of student enrollment by race - Native Hawaiian or other Pacific Islander",
        american_indian: "Percentage of student enrollment by race - American Indian or Native Alaskan",
        other: "Percentage of student enrollment by race - Other",
        committed_to_master_schedule: "Are you committed to including this course on the master schedule in 2020-21 if this teacher is accepted into the program?",
        replace_course: "Will this course replace an existing computer science course in the master schedule? (Principal's response)",
        replace_which_course_csp: "Which existing course or curriculum will CS Principles replace?",
        replace_which_course_csd: "Which existing course or curriculum will CS Discoveries replace?",
        csp_implementation: "How will you implement CS Principles at your school?",
        csd_implementation: "How will you implement CS Discoveries at your school?",
        committed_to_diversity: "Do you commit to recruiting and enrolling a diverse group of students in this course, representative of the overall demographics of your school?",
        pay_fee: "If there is a fee for the program, will your teacher or your school be able to pay for the fee?",
        share_ap_scores: "Principal authorizes college board to send AP Scores",
      },
      nces: {
        title_i_status: "Title I status code (NCES data)",
        rural_status: 'Rural Status',
        students_total: "Total student enrollment (NCES data)",
        frl_eligible_total: "Percentage of students who are eligible to receive free or reduced lunch (NCES data)",
        urm_percent: "Percentage of underrepresented minority students (NCES data)",
        student_wh_count: "Percentage of student enrollment by race - White (NCES data)",
        student_bl_count: "Percentage of student enrollment by race - Black or African American (NCES data)",
        student_hi_count: "Percentage of student enrollment by race - Hispanic or Latino (NCES data)",
        student_as_count: "Percentage of student enrollment by race - Asian (NCES data)",
        student_hp_count: "Percentage of student enrollment by race - Native Hawaiian or other Pacific Islander (NCES data)",
        student_am_count: "Percentage of student enrollment by race - American Indian or Native Alaskan (NCES data)",
        student_tr_count: "Percentage of student enrollment by race - Two or more races (NCES data)",
      }
    }

    MULTI_ANSWER_QUESTION_FIELDS = {
      school_name: {principal: :principal_school_name},
      district_name: {principal: :principal_school_district},
      principal_first_name: {teacher: :principal_first_name, principal: :principal_response_first_name},
      principal_last_name: {teacher: :principal_last_name, principal: :principal_response_last_name},
      principal_email: {teacher: :principal_email, principal: :principal_response_email},

      replace_existing: {teacher: :replace_existing, principal: :principal_wont_replace_existing_course},

      pay_fee: {teacher: :pay_fee, principal: :principal_pay_fee},

      contact_invoicing: {principal: :principal_contact_invoicing},
      contact_invoicing_detail: {principal: :principal_contact_invoicing_detail},

      title_i_status: {stats: :title_i_status},
      rural_status: {stats: :rural_status},
      school_type: {teacher: :school_type, stats: :school_type},
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
      committed: YES_NO,
      plan_to_teach: YES_NO,
      previous_yearlong_cdo_pd: YES_NO,
      replace_existing: YES_NO,
      principal_approval: YES_NO,
      principal_schedule_confirmed: YES_NO,
      # Scholarship requirements
      free_lunch_percent: YES_NO,
      underrepresented_minority_percent: YES_NO,
    }

    # Need to explicitly list these for the shared constant generation to work.
    SCOREABLE_QUESTIONS = {
      scholarship_questions: [
        :underrepresented_minority_percent,
        :free_lunch_percent,
      ],
      criteria_score_questions_csd: [
        :csd_which_grades,
        :committed,
        :plan_to_teach,
        :previous_yearlong_cdo_pd,
        :replace_existing,
        :principal_approval,
        :principal_schedule_confirmed,
      ],
      criteria_score_questions_csp: [
        :csp_which_grades,
        :committed,
        :plan_to_teach,
        :previous_yearlong_cdo_pd,
        :replace_existing,
        :principal_approval,
        :principal_schedule_confirmed,
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
        :cs_how_many_minutes,
        :cs_how_many_days_per_week,
        :cs_how_many_weeks_per_year,
        :cs_total_course_hours,
        :plan_to_teach,
        :replace_existing,
        :replace_which_course,
        :previous_yearlong_cdo_pd,
        :committed,
        :able_to_attend_multiple,
        :travel_to_another_workshop,
        :willing_to_travel,
        :interested_in_online_program,
        :pay_fee,
        :scholarship_reasons,
        :gender_identity,
        :race,
        :how_heard,
        :principal_approval_url
      ],
      principal: [
        :title,
        :first_name,
        :last_name,
        :email,
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
        :committed_to_master_schedule,
        :replace_course,
        :replace_which_course_csp,
        :replace_which_course_csd,
        :csp_implementation,
        :csd_implementation,
        :committed_to_diversity,
        :pay_fee,
        :share_ap_scores,
        :contact_invoicing,
        :contact_invoicing_detail
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

    TEXT_FIELDS = {
      other_with_text: 'Other:'.freeze,
      other_please_list: 'Other (Please List):'.freeze,
      other_please_explain: 'Other (Please Explain):'.freeze,
      not_teaching_this_year: "I'm not teaching this year (Please Explain):".freeze,
      not_teaching_next_year: "I'm not teaching next year (Please Explain):".freeze,
      dont_know_if_i_will_teach_explain: "I don't know if I will teach this course (Please Explain):".freeze,
      unable_to_attend: "No, I'm unable to attend (Please Explain):".freeze,
      able_to_attend_single: "Yes, I'm able to attend".freeze,
      no_explain: "No (Please Explain):".freeze,
      no_pay_fee: "No, my school or I will not be able to pay the summer workshop program fee.".freeze,
      i_dont_know_explain: "I don't know (Please Explain):",
      no_pay_fee_2021: 'No, my school will not be able to pay the program fee. I would like to be considered for a scholarship.',
      no_pay_fee_1920: 'No, my school will not be able to pay the program fee. I would like to be considered for a scholarship.',
      not_sure_explain: 'Not sure (Please Explain):',
      unable_to_attend_2021: 'I’m not able to attend any of the above workshop dates. (Please Explain):',
      unable_to_attend_1920: 'I’m not able to attend any of the above workshop dates. (Please Explain):'
    }.freeze

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
