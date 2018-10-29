module Pd
  module Teacher1920ApplicationConstants
    include Pd::TeacherCommonApplicationConstants

    # Remove newlines and leading whitespace from multiline strings
    def self.clean_multiline(string)
      string.gsub(/\n\s*/, ' ')
    end

    SECTION_HEADERS = {
      section_1_about_you: 'About You',
      section_2_choose_your_program: 'Choose Your Program',
      section_3_teaching_background: 'Teaching Background',
      section_4_professional_learning_program_requirements: 'Professional Learning Program Requirements',
      section_5_additional_demographic_information: 'Additional Demographic Information',
      section_6_submission: 'Submission',
      detail_view_principal_approval: 'Principal Approval'
    }

    PAGE_LABELS = {
      section_1_about_you: BASE_PAGE_LABELS[:section_1_about_you].slice(
        :country,
        :title,
        :first_name,
        :last_name,
        :account_email,
        :alternate_email,
        :address,
        :city,
        :state,
        :zip_code,
      ).merge(
        {
          phone: 'Home or Cell Phone',
          school: 'School',
          school_name: 'School name',
          school_district_name: 'School district name',
          school_address: 'School address',
          school_city: 'City',
          school_state: 'State',
          school_zip_code: 'Zip code',
          school_type: 'My school is a',

          principal_first_name: "Principal's first name",
          principal_last_name: "Principal's last name",
          principal_title: "Principal's title",
          principal_email: "Principal's email address",
          principal_confirm_email: "Confirm principal's email address",
          principal_phone_number: "Principal's phone number",
          current_role: 'What is your current role at your school?',
          completing_on_behalf_of_someone_else: 'Are you completing this application on behalf of someone else?',
          completing_on_behalf_of_name: 'If yes, please include the full name and role of the teacher and why you are applying on behalf of this teacher.'
        }
      ),
      section_2_choose_your_program: {
        program: clean_multiline(
          'Which professional learning program would you like to join for the 2019-20
          school year? Note: this application is only for Computer Science Discoveries and
          Computer Science Principles. If you are interested in teaching Advanced
          Placement CS A (in Java), visit this
          [AP CS A overview](https://code.org/educate/curriculum/apcsa). Review this
          [guidance document](https://docs.google.com/document/d/1nFp033SuO_BMR-Bkinrlp0Ti_s-XYQDsOc-UjqNdrGw/edit#heading=h.6s62vrpws18)
          to make sure your course implementation plans meet program requirements.'
        ),
        csd_which_grades: clean_multiline(
          'To which grades does your school plan to offer CS Discoveries in the 2019-20 school year?
           Please note that the CS Discoveries Professional Learning Program
           is not available for grades K-5. (select all that apply)'
        ),
        csp_which_grades: clean_multiline(
          'To which grades does your school plan to offer CS Principles in the 2019-20
          school year? Please note that the CS Principles Professional Learning Program
          is not available for grades K-8. (select all that apply)'
        ),
        csp_how_offer: BASE_PAGE_LABELS[:section_3_choose_your_program][:csp_how_offer],
        cs_how_many_minutes: clean_multiline(
          'How many minutes will your CS program class last? (Include the
          number of minutes from start to finish that you see your students per class
          period. If it varies from day to day, estimate the average number of minutes
          you meet per class period.)'
        ),
        cs_how_many_days_per_week: 'How many days per week will your CS program class be offered to one section of students?',
        cs_how_many_weeks_per_year: 'How many weeks during the year will this course be taught to one section of students?',
        cs_total_course_hours: 'Computed total course hours',
        cs_terms: 'How will you be offering this CS program course to students?',
        plan_to_teach: BASE_PAGE_LABELS[:section_3_choose_your_program][:plan_to_teach].sub('18-19', '19-20'),
        replace_existing: 'Will this course replace an existing computer science course in the master schedule? If yes, please list the course(s) that will be replaced.',
        replace_which_course: 'If yes, please describe the course it will be replacing and why:'
      },
      section_3_teaching_background:
        BASE_PAGE_LABELS[:section_2_your_school].slice(
          :does_school_require_cs_license,
          :what_license_required,
          :have_cs_license,
          :subjects_licensed_to_teach,
          :taught_in_past,
          :cs_offered_at_school,
          :previous_yearlong_cdo_pd
        ).merge({subjects_teaching: BASE_PAGE_LABELS[:section_2_your_school][:subjects_teaching].gsub('17-18', '18-19')}),
      section_4_professional_learning_program_requirements:
        {
          committed: BASE_PAGE_LABELS[:section_4_summer_workshop][:committed],
          able_to_attend_multiple: 'Your Regional Partner is hosting local summer workshop(s) at the following dates and locations. Please indicate which workshops you are able to attend. Select all that apply.',
          travel_to_another_workshop: 'If you are unable to make any of the above workshop dates, would you be open to traveling to another region for your local summer workshop?',
          willing_to_travel: BASE_PAGE_LABELS[:section_4_summer_workshop][:willing_to_travel],
          interested_in_online_program: 'Are you interested in this online program for school year workshops?',
          pay_fee: BASE_PAGE_LABELS[:section_4_summer_workshop][:pay_fee],
          scholarship_reasons: 'Please provide any additional information you’d like to share about why your application should be considered for a scholarship.'
        },
      section_5_additional_demographic_information:
        BASE_PAGE_LABELS[:section_5_submission].slice(:gender_identity, :race).merge(
          {
            how_heard: 'How did you hear about this program?'
          }
        ),
      section_6_submission: BASE_PAGE_LABELS[:section_5_submission].slice(:agree),
      detail_view_principal_approval: {
        principal_approval: 'Principal approves this application',
        principal_plan_to_teach: 'Applying teacher will teach this course',
        principal_schedule_confirmed: 'Principal has confirmed that CS will be on the master schedule',
        principal_implementation: 'How will this course be implemented? (Principal response)',
        principal_diversity_recruitment: 'Principal has committed to recruiting diverse students',
        principal_free_lunch_percent: 'Percent of students that receive free/reduced lunch',
        principal_underrepresented_minority_percent: 'Percent of students that are underrepresented minorities',
        principal_wont_replace_existing_course: 'Will this replace an existing CS course? (Principal response)',
        principal_how_heard: 'How did you hear about Code.org? (Principal response)',
        principal_send_ap_scores: 'Principal authorizes college board to send AP Scores',
        principal_pay_fee: 'Can the school or teacher pay the summer workshop program fee? (Principal response)'
      }
    }.freeze

    CSV_LABEL_OVERRIDES = {
      teacher: {
        date_applied: "Date Applied",
        date_accepted: "Date Accepted",
        status: "Status",
        meets_criteria: "Meets minimum requirements?",
        meets_scholarship_criteria: "Meets scholarship requirements?",
        phone: "Home or cell phone",
        regional_partner_name: "Regional Partner",
        assigned_workshop: "Assigned Workshop",
        total_score: "Total score",
        notes: "Notes",
        alternate_email: "Alternate email",
        district_name: "School district",
        school_city: "School city",
        school_state: "School state",
        school_zip_code: "School zip code",
        current_role: "Current role",
        program: "Which professional learning program would you like to join for the 2019-20 school year?",
        csd_which_grades: "To which grades does your school plan to offer CS Discoveries in the 2019-20 school year?",
        csp_which_grades: "To which grades does your school plan to offer CS Principles in the 2019-20 school year?",
        cs_how_many_minutes: "How many minutes will your CS Program class last?",
        cs_total_course_hours: "Total course hours",
        replace_existing: "Will this course replace an existing computer science course in the master schedule? (Teacher's response)",
        subjects_teaching: "What subjects are you teaching this year (2018-19)?",
        subjects_licensed_to_teach: "Which subject area(s) are you currently licensed to teach?",
        taught_in_past: "Have you taught computer science courses or activities in the past?",
        previous_yearlong_cdo_pd: "Have you participated in previous yearlong Code.org Professional Learning Programs?",
        cs_offered_at_school: "What computer science courses or activities are currently offered at your school?",
        able_to_attend_multiple: "Please indicate which workshops you are able to attend.",
        willing_to_travel: "How far would you be willing to travel to academic year workshops?",
        how_heard: "How did you hear about this program? (Teacher's response)",
        gender_identity: "Gender identity",
        race: "Race"
      },
      principal: {
        title: "Principal title (provided by principal)",
        first_name: "Principal first name (provided by principal)",
        last_name: "Principal last name (provided by principal)",
        email: "Principal email address (provided by principal)",
        # "School Name (provided by principal)",
        # "School District (provided by principal)",
        do_you_approve: "Do you approve of this teacher participating in Code.org's 2019-20 Professional Learning Program?",
        plan_to_teach: "Is this teacher planning to teach this course in the 2019-20 school year?",
        total_student_enrollment: "Total student enrollment",
        free_lunch_percent: "Percentage of students who are eligible to receive free or reduced lunch (Principal’s response)",
        underrepresented_minority_percent: "Percentage of underrepresented minority students (Principal’s response)",
        white: "Percentage of student enrollment by race - White",
        black: "Percentage of student enrollment by race - Black or African American",
        hispanic: "Percentage of student enrollment by race - Hispanic or Latino",
        asian: "Percentage of student enrollment by race - Asian",
        pacific_islander: "Percentage of student enrollment by race - Native Hawaiian or other Pacific Islander",
        american_indian: "Percentage of student enrollment by race - American Indian or Native Alaskan",
        other: "Percentage of student enrollment by race - Other",
        committed_to_master_schedule: "Are you committed to including this course on the master schedule in 2019-20 if this teacher is accepted into the program?",
        replace_course: "Will this course replace an existing computer science course in the master schedule? (Principal’s response)",
        replace_which_course_csp: "Which existing course or curriculum will CS Principles replace?",
        replace_which_course_csd: "Which existing course or curriculum will CS Discoveries replace?",
        csp_implementation: "How will you implement CS Principles at your school?",
        csd_implementation: "How will you implement CS Discoveries at your school?",
        committed_to_diversity: "Do you commit to recruiting and enrolling a diverse group of students in this course, representative of the overall demographics of your school?",
        pay_fee: "If there is a fee for the program, will your teacher or your school be able to pay for the fee?",
        how_heard: "How did you hear about this program? (Principal’s response)",
        share_ap_scores: "Principal authorizes college board to send AP Scores",
      },
      nces: {
        title_i_status: "Title I status code (NCES data)",
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

    LABEL_OVERRIDES = {
      program: 'Which professional learning program would you like to join for the 2019-20 school year?',
      cs_how_many_minutes: 'How many minutes will your class last?'
    }.freeze

    ALL_LABELS = PAGE_LABELS.values.reduce(:merge).freeze
    ALL_LABELS_WITH_OVERRIDES = ALL_LABELS.map {|k, v| [k, LABEL_OVERRIDES[k] || v]}.to_h.freeze

    VALID_SCORES = {
      # Minimum requirements
      regional_partner_name: YES_NO,
      csd_which_grades: YES_NO,
      csp_which_grades: YES_NO,
      cs_total_course_hours: YES_NO,
      plan_to_teach: YES_NO,
      have_cs_license: YES_NO,
      committed: YES_NO,
      willing_to_travel: YES_NO,
      principal_approval: YES_NO,
      principal_plan_to_teach: YES_NO,
      principal_schedule_confirmed: YES_NO,
      principal_diversity_recruitment: YES_NO,
      # Scholarship requirements
      previous_yearlong_cdo_pd: YES_NO,
      # Bonus Points
      csp_how_offer: [2, 0],
      replace_existing: [5, 0],
      taught_in_past: [2, 0],
      principal_free_lunch_percent: [5, 0],
      principal_underrepresented_minority_percent: [5, 0]
    }

    # Need to explicitly list these for the shared constant generation to work.
    SCOREABLE_QUESTIONS = {
      bonus_points: [
        :csp_how_offer,
        :replace_existing,
        :taught_in_past,
        :principal_free_lunch_percent,
        :principal_underrepresented_minority_percent
      ],
      scholarship_questions: [
        :previous_yearlong_cdo_pd,
        :principal_approval,
        :principal_plan_to_teach,
        :principal_schedule_confirmed,
        :principal_diversity_recruitment
      ],
      criteria_score_questions_csd: [
        :regional_partner_name,
        :csd_which_grades,
        :cs_total_course_hours,
        :plan_to_teach,
        :have_cs_license,
        :committed,
        :willing_to_travel
      ],
      criteria_score_questions_csp: [
        :regional_partner_name,
        :csp_which_grades,
        :cs_total_course_hours,
        :plan_to_teach,
        :have_cs_license,
        :committed,
        :willing_to_travel
      ]
    }

    SCHOLARSHIP_QUESTIONS = [
      :previous_yearlong_cdo_pd,
      :principal_approval,
      :principal_plan_to_teach,
      :principal_schedule_confirmed,
      :principal_diversity_recruitment
    ]

    CRITERIA_SCORE_QUESTIONS_CSP = (
      VALID_SCORES.select {|_, v| v == YES_NO}.keys -
        [:csd_which_grades] - SCHOLARSHIP_QUESTIONS
    ).freeze
    CRITERIA_SCORE_QUESTIONS_CSD = (
      VALID_SCORES.select {|_, v| v == YES_NO}.keys -
        [:csp_how_offer, :csp_which_grades] - SCHOLARSHIP_QUESTIONS
    ).freeze

    CSV_COLUMNS = {
      teacher: [
        :date_applied,
        :date_accepted,
        :status,
        :meets_criteria,
        :meets_scholarship_criteria,
        :total_score,
        :notes,
        :title,
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
        :regional_partner_name,
        :phone,
        :address,
        :city,
        :state,
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
        :cs_terms,
        :plan_to_teach,
        :replace_existing,
        :replace_which_course,
        :subjects_teaching,
        :does_school_require_cs_license,
        :what_license_required,
        :have_cs_license,
        :subjects_licensed_to_teach,
        :taught_in_past,
        :previous_yearlong_cdo_pd,
        :cs_offered_at_school,
        :committed,
        :able_to_attend_multiple,
        :travel_to_another_workshop,
        :willing_to_travel,
        :interested_in_online_program,
        :pay_fee,
        :scholarship_reasons,
        :gender_identity,
        :race,
        :how_heard
      ],
      principal: [
        :title,
        :first_name,
        :last_name,
        :email,
        # "School Name (provided by principal)",
        # "School District (provided by principal)",
        :do_you_approve,
        :plan_to_teach,
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
        :how_heard,
        :share_ap_scores,
      ],
      nces: [
        :title_i_status,
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
  end
end
