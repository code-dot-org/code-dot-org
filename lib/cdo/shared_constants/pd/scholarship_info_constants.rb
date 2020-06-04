module Pd
  module ScholarshipInfoConstants
    SCHOLARSHIP_STATUSES = [
      NO = 'no'.freeze,
      YES_CDO = 'yes_code_dot_org'.freeze,
      YES_OTHER = 'yes_other'.freeze
    ].freeze

    COURSE_SPECIFIC_SCHOLARSHIP_STATUSES = {
      'csp' => SCHOLARSHIP_STATUSES + [YES_EIR = 'yes_eir'],
      'csd' => SCHOLARSHIP_STATUSES,
      'csf' => SCHOLARSHIP_STATUSES
    }

    SCHOLARSHIP_DROPDOWN_OPTIONS = [
      {value: NO, label: "No, paid teacher"},
      {value: YES_CDO, label: "Yes, Code.org scholarship"},
      {value: YES_OTHER, label: "Yes, other funding (non code.org)"}
    ].freeze

    COURSE_SPECIFIC_SCHOLARSHIP_DROPDOWN_OPTIONS = {
      'csp' => SCHOLARSHIP_DROPDOWN_OPTIONS + [{value: YES_EIR, label: "Yes, EIR scholarship"}],
      'csd' => SCHOLARSHIP_DROPDOWN_OPTIONS,
      'csf' => SCHOLARSHIP_DROPDOWN_OPTIONS
    }
  end
end
