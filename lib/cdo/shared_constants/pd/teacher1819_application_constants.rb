module Pd
  module Teacher1819ApplicationConstants
    SECTION_HEADERS = {
      section_1_about_you: 'About You',
      section_2_your_school: 'Your School',
      section_3_choose_your_program: 'Choose Your Program',
      section_4_summer_workshop: 'Summer Workshop',
      section_5_submission: 'Submission',
      detail_view_principal_approval: 'Principal Approval'
    }.freeze

    PAGE_LABELS = {
      section_1_about_you: {
        country: 'Country',
        title: 'Title',
        first_name: 'First name',
        last_name: 'Last name',
        account_email: 'Account email',
        alternate_email: 'If you use another email (especially during summer months), enter it here:',
        phone: 'Home or Cell Phone',
        address: 'Home address',
        city: 'City',
        state: 'State',
        zip_code: 'Zip code',
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
        principal_email: "Principal's email address",
        principal_confirm_email: "Confirm principal's email address",
        principal_phone_number: "Principal's phone number",
        current_role: 'What is your current role at your school?',
      },

      section_2_your_school: {
        grades_at_school: 'What grades are served at your school? (select all that apply)',
        grades_teaching: 'What grades are you teaching this year (2017-18)? (select all that apply)',
        grades_expect_to_teach: clean_multiline(
          'Based on current plans for the 2018-19 school year, what grade(s) do you expect
           to teach next year (2018-19)? (select all that apply)'
        ),
        subjects_teaching: 'What subjects are you teaching this year (2017-18)? (select all that apply)',
        subjects_expect_to_teach: clean_multiline(
          'Based on current plans for the 2018-19 school year, what subject(s) do you
           expect to teach next year (2018-19)? (select all that apply)'
        ),
        does_school_require_cs_license:
          'Does your school district require any specific licenses, certifications, or endorsements to teach computer science?',
        have_cs_license:
          'Do you have the required licenses, certifications, or endorsements to teach computer science in your district?',
        what_license_required:
          'What license, certification, or endorsement is required?',
        subjects_licensed_to_teach:
          'Which subject area(s) are you currently licensed to teach? (select all that apply)',
        taught_in_past: clean_multiline(
          'Have you taught computer science courses or activities in the past?
           If so, what have you taught? (select all that apply).
           Note: no computer science experience is necessary or expected
           to participate in the Professional Learning Program.'
        ),
        previous_yearlong_cdo_pd: clean_multiline(
          "Have you participated in previous yearlong Code.org Professional Learning Programs?
           If so, mark the programs you've participated in."
        ),
        cs_offered_at_school:
          'What computer science courses or activities are currently offered at your school? (select all that apply)',
        cs_opportunities_at_school:
          'What computer science opportunities currently exist at your school? (select all that apply)',
      },

      section_3_choose_your_program: {
        program: clean_multiline(
          'Which professional learning program would you like to join for the 2018-19 school year?
           Note: this application is only for
           [Computer Science Discoveries](https://code.org/educate/professional-learning/cs-discoveries)
           and [Computer Science Principles](https://code.org/educate/professional-learning/cs-principles).
           If you are interested in teaching Advanced Placement CS A (in Java), visit
           [this AP CS A overview](https://code.org/educate/curriculum/apcsa).'
        ),

        csd_which_grades: clean_multiline(
          'To which grades does your school plan to offer CS Discoveries?
           Please note that the CS Discoveries Professional Learning Program
           is not available for grades K-5. (select all that apply)'
        ),
        csd_course_hours_per_week:
          'How many course hours per week will your school offer CS Discoveries for each class? [(Click here for guidance on required number of hours.)](https://support.code.org/hc/en-us/articles/360002245611)',
        csd_course_hours_per_year:
          'Approximately how many course hours per school year will your school offer CS Discoveries? [(Click here for guidance on required number of hours.)](https://support.code.org/hc/en-us/articles/360002245611)',
        csd_terms_per_year: 'How many terms will this course span in one school year?',

        csp_which_grades: clean_multiline(
          'To which grades does your school plan to offer CS Principles?
           Please note that the CS Principles Professional Learning Program
           is not available for grades K-8. (select all that apply)'
        ),
        csp_course_hours_per_week:
          'How many course hours per week will your school offer CS Principles? [(Click here for guidance on required number of hours.)](https://support.code.org/hc/en-us/articles/360002245611)',
        csp_course_hours_per_year:
          'Approximately how many course hours per school year will your school offer CS Principles? [(Click here for guidance on required number of hours.)](https://support.code.org/hc/en-us/articles/360002245611)',
        csp_terms_per_year: 'How many terms will this course span in one school year?',
        csp_how_offer: 'How will you offer CS Principles?',
        csp_ap_exam: clean_multiline(
          'Are you planning for your students to take the AP CS Principles exam in the spring of 2019?
           Note: even if CS Principles is taught as an introductory course,
           students are still eligible to take the AP CS Principles exam.'
        ),

        plan_to_teach: 'Do you plan to personally teach this course in the 2018-19 school year?',
      },

      section_4_summer_workshop: {
        able_to_attend_single: 'Are you able to attend your assigned summer workshop?',
        able_to_attend_multiple: clean_multiline(
          'Your Regional Partner has more than one local summer workshop in your region.
           Are you able to attend any of these assigned summer workshops? Select all that apply.'
        ),
        alternate_workshops: clean_multiline(
          'If you are not able to attend your local summer workshop, which of the following
           alternate workshops are you available to attend?
           __Please note that we are not able to guarantee a space for you in a different location,
           and you will be responsible for the costs related to traveling to that location.__
           Select all that apply.'
        ),
        understand_fee: clean_multiline(
          'By checking this box, you indicate that you understand there may be a program fee
           for the summer workshop you attend.'
        ),
        pay_fee: 'Will your school be able to pay the fee?',
        consider_for_funding:
          'Would you like to be considered for funding support? Note that funding support is not guaranteed.',
        committed: 'Are you committed to participating in the entire Professional Learning Program?',
        willing_to_travel: clean_multiline(
          'The four one-day school year workshops are typically held on Saturdays, with an approximate
           schedule of 9am - 4pm. How far would you be willing to travel to each workshop?'
        )
      },

      section_5_submission: {
        gender_identity: 'Gender identity',
        race: 'Race',
        agree: clean_multiline(
          'By submitting this application, I agree to share my contact information
           and application with Code.org’s Regional Partners.'
        )
      },

      detail_view_principal_approval: {
        principal_approval: 'Principal approves this application',
        schedule_confirmed: 'Principal has confirmed that CS will be on the master schedule',
        wont_replace_existing_course: 'Will this replace an existing CS course?',
        diversity_recruitment: 'Principal has committed to recruiting diverse students',
        free_lunch_percent: 'Percent of students that receive free/reduced lunch',
        underrepresented_minority_percent: 'Percent of students that are underrepresented minorities',
        can_pay_fee: 'Can the school or teacher pay the summer workshop program fee?'
      }
    }.freeze

    LABEL_OVERRIDES = {
      taught_in_past: 'Have you taught computer science courses or activities in the past?',
      program: 'Which professional learning program would you like to join for the 2020-21 school year?',
      csd_which_grades: 'To which grades does your school plan to offer CS Discoveries?',
      csp_which_grades: 'To which grades does your school plan to offer CS Principles?',
      csp_ap_exam: 'Are you planning for your students to take the AP CS Principles exam in the spring of 2019?',
      alternate_workshops: 'Which of the following alternate workshops are you available to attend?',
      willing_to_travel: 'How far would you be willing to travel to each workshop?'
    }.freeze

    ALL_LABELS = PAGE_LABELS.values.reduce(:merge).freeze
    ALL_LABELS_WITH_OVERRIDES = ALL_LABELS.map {|k, v| [k, LABEL_OVERRIDES[k] || v]}.to_h.freeze
  end
end
