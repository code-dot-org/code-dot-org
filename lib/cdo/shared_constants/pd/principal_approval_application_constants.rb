module Pd
  module PrincipalApprovalApplicationConstants
    YES_NO = %w(Yes No).freeze

    # Remove newlines and leading whitespace from multiline strings
    def self.clean_multiline(string)
      string.gsub(/\n\s*/, ' ')
    end

    TEXT_FIELDS = {
      other_with_text: 'Other:'.freeze,
      other_please_explain: 'Other (Please Explain):'.freeze,
      dont_know_explain: "I don't know (Please Explain):".freeze,
      yes_replace_existing_course: 'Yes, it will replace an existing computer science course'.freeze
    }.freeze

    PAGE_LABELS = {
      first_name: 'Administrator/School Leader First Name',
      last_name: 'Administrator/School Leader Last Name',
      title: 'Administrator/School Leader Title',
      role: 'Administrator/School Leader Role',
      email: 'Administrator/School Leader Email Address',
      can_email_you: 'Would you like to receive email updates about our courses, local opportunities, or other computer science news? (roughly once a month)',
      total_student_enrollment: 'Total student enrollment',
      free_lunch_percent: 'Percent of students who are eligible to receive free or reduced lunch',
      white: 'White',
      black: 'Black or African American',
      hispanic: 'Hispanic or Latino',
      asian: 'Asian',
      pacific_islander: 'Native Hawaiian or other Pacific Islander',
      american_indian: 'American Indian or Native Alaskan',
      other: 'Other',
      replace_course: 'Will this course replace an existing computer science course in the master schedule?',
      pay_fee: 'If there is a fee for the program, would your school be able to pay for the fee?',
      contact_invoicing: "Contact name for invoicing (if applicable)",
      contact_invoicing_detail: "Contact email or phone number for invoicing (if applicable)",
      confirm_principal: 'By submitting this application, I confirm that I am an Administrator/School Leader of this school and agree to share my contact info, school info, and this application with [regional partner].',

      school: 'School',
      school_name: 'School Name',
      school_address: 'School Address',
      school_city: 'City',
      school_state: 'State',
      school_zip_code: 'Zip Code',
      school_type: 'My school is a',
    }.freeze

    # These fields have labels determined on the client
    FIELDS_WITH_DYNAMIC_LABELS = [
      :do_you_approve
    ].freeze

    ALL_LABELS = PAGE_LABELS.merge(
      # map array of field names to hash of {field_name: nil}
      FIELDS_WITH_DYNAMIC_LABELS.map {|field_name| [field_name, nil]}.to_h
    ).freeze
  end
end
