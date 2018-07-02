module PrincipalApproval1819ApplicationConstants
  YES_NO = %w(Yes No).freeze

  # Remove newlines and leading whitespace from multiline strings
  def self.clean_multiline(string)
    string.gsub(/\n\s*/, ' ')
  end

  PAGE_LABELS = {
    first_name: 'First Name',
    last_name: 'Last Name',
    title: 'Title',
    email: 'Email Address',
    total_student_enrollment: 'Total student enrollment',
    free_lunch_percent: 'Percentage of students who receive free or reduced lunch',
    white: 'White',
    black: 'Black or African American',
    hispanic: 'Hispanic or Latino',
    asian: 'Asian',
    pacific_islander: 'Native Hawaiian or other Pacific Islander',
    american_indian: 'American Indian or Native Alaskan',
    other: 'Other',
    do_you_approve: "Do you approve of this teacher's application to participate in Code.org’s 2018 - 19 Professional Learning Program?",
    committed_to_master_schedule: 'Are you committed to including this program on the master schedule in 2018-19 if this teacher is accepted into the program. Note: the program may be listed under a different course name as determined by your district.',
    hours_per_year: 'Approximately how many course hours per school year will your school offer this course?',
    terms_per_year: 'How many terms will this course span in one school year?',
    replace_course: 'Will this course replace an existing computer science course in the master schedule? If yes, please list the course(s) that will be replaced.',
    replace_which_course_csp: 'Which existing course or curriculum will CS Principles replace? Mark all that apply.',
    replace_which_course_csd: 'Which existing course or curriculum will CS Discoveries replace? Mark all that apply.',
    committed_to_diversity: 'Do you commit to recruiting and enrolling a diverse group of students in this course, representative of  the overall demographics of your school?',
    understand_fee: 'By checking this box, you indicate that you understand there may be a program fee for the summer workshop your teacher attends.',
    pay_fee: 'If there is a fee for the summer workshop, will your teacher or your school be able to pay for the fee?',
    want_funding: 'Yes, I would like to be considered for funding support.',
    confirm_principal: 'By submitting this application, I confirm I am the principal of this school.',

    school: 'School',
    school_name: 'School Name',
    school_address: 'School Address',
    school_city: 'City',
    school_state: 'State',
    school_zip_code: 'Zip Code',
    school_type: 'My school is a',
  }.freeze

  TEXT_FIELDS = {
    other_with_text: 'Other:'.freeze,
    other_please_explain: 'Other (Please Explain):'.freeze,
    dont_know_explain: "I don't know (Please Explain):".freeze
  }.freeze
end
