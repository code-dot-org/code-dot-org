module Teacher1819ApplicationConstants
  # Remove newlines and leading whitespace from multiline strings
  def self.clean_multiline(string)
    string.gsub(/\n\s*/, ' ')
  end

  SECTION_HEADERS = {
    section_1_about_you_and_your_school: 'About You and Your School',
    section_2_choose_your_program: 'Section 2: Choose Your Program',
    section_3_summer_workshop: 'Section 3: Summer Workshop',
    section_4_submission: 'Section 4: Submission'
  }

  PAGE_LABELS = {
    section_1_about_you_and_your_school: {
      country: 'Country',
      title: 'Title',
      first_name: 'First Name',
      preferred_first_name: 'Preferred First Name',
      last_name: 'Last Name',
      account_email: 'Account Email',
      alternate_email: 'If you use another email, enter it here:',
      phone: 'Phone',
      address: 'Home Address',
      city: 'City',
      state: 'State',
      zip_code: 'Zip Code',
      gender_identity: 'Gender Identity',
      race: 'Race',
      principal_first_name: "Principal's first name",
      principal_last_name: "Principal's last name",
      principal_title: "Principal's Title",
      principal_email: "Principal's email address",
      confirm_principal_email: "Confirm principal's email address",
      principal_phone_number: "Principal's phone number",
      current_role: 'What is your current role at your school?',
      grades_at_school: 'What grades are served at your school? (Select all that apply)',
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
      subjects_licensed_to_teach:
        'Which subject area(s) are you currently licensed to teach? (select all that apply)',
      taught_in_past: clean_multiline(
        'Have you taught computer science courses or activities in the past?
         If so, what have you taught? (select all that apply).
         Note: no computer science experience is necessary or expected
         to participate in the Professional Learning Program.'
      ),
      cs_offered_at_school:
        'What computer science courses or activities are currently offered at your school? (select all that apply)',
      cs_opportunities_at_school:
        'What computer science opportunities currently exist at your school? (select all that apply)',
    },

    section_2_choose_your_program: {
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
        'How many course hours per week will your school offer CS Discoveries per class?',
      csd_course_hours_per_year:
        'Approximately how many course hours per school year will your school offer CS Discoveries?',
      csd_terms_per_year: 'How many terms will this course span in one school year?',

      csp_which_grades: clean_multiline(
        'To which grades does your school plan to offer CS Principles?
         Please note that the CS Principles Professional Learning Program
         is not available for grades K-8. (select all that apply)'
      ),
      csp_course_hours_per_week:
        'How many course hours per week will your school offer CS Principles?',
      csp_course_hours_per_year:
        'Approximately how many course hours per school year will your school offer CS Principles?',
      csp_terms_per_year: 'How many terms will this course span in one school year?',
      csp_how_offer: 'How will you offer CS Principles?',
      csp_ap_exam: clean_multiline(
        'Are you planning for your students to take the AP CS Principles exam in the spring of 2019?
         Note: even if CS Principles is taught as an introductory course,
         students are still eligible to take the AP CS Principles exam.'
      ),

      plan_to_teach: 'Do you plan to personally teach this course in the 2018-19 school year?',
    },

    section_3_summer_workshop: {
      able_to_attend_single: 'Are you able to attend your assigned summer workshop?',
      able_to_attend_multiple: 'Are you able to attend any of these assigned summer workshops?',
      alternate_workshops: clean_multiline(
        'If you are not able to attend your assigned summer workshop, which of the following
         alternate workshops are you available to attend? Please note that we are not able to
         guarantee a space for you in a different location, and you will be responsible for the
         costs related to traveling to that location. (select all that apply)'
      ),
      committed: 'Are you committed to participating in the entire Professional Learning Program?',
      willing_to_travel: clean_multiline(
        'The four one-day school year workshops are typically held on Saturdays, with an approximate
         schedule of 9 am - 4pm. How far would you be willing to travel to each workshop?'
      )
    },

    section_4_submission: {
      agree: clean_multiline(
        'By submitting this application, I agree to share my contact information
         and application with Code.org’s Regional Partners.'
      )
    }
  }

  ALL_LABELS = PAGE_LABELS.values.reduce(:merge)
end
