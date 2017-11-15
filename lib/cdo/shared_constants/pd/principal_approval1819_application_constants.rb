module PrincipalApproval1819ApplicationConstants
  def self.clean_multiline(string)
    string.gsub(/\n\s*/, ' ')
  end

  PAGE_LABELS = {
    title: 'Title',
    first_name: 'First Name',
    preferred_first_name: 'Preferred First Name',
    last_name: 'Last Name',
    principal_email: 'Principal Email',
    phone: 'Phone',
    school_name: 'School Name',
    total_enrollment: 'Total student enrollment',
    free_lunch_percent: 'Percentage of students that receive free or reduced lunch',
    # Student enrollment by ethnicity is a separate work item
    # Teacher participation may be a separate work item
    # Schedule commitment
    course_hours: 'Approximately how many course hours per school year will your school offer this course?',
    course_terms: 'How many terms will this course span in one school year?',
    replace_existing: 'Will this course replace an existing computer science course in the master schedule? If yes, please list the course(s) that will be replaced',
    courses_replaced_csp: 'Which existing course or curriculum will CS Principles replace? Mark '
  }
end