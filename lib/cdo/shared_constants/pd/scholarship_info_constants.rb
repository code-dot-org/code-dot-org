module Pd
  module ScholarshipInfoConstants
    SCHOLARSHIP_STATUSES = [
      NO = 'no'.freeze,
      YES_CDO = 'yes_code_dot_org'.freeze,
      YES_OTHER = 'yes_other'.freeze
    ].freeze

    SCHOLARSHIP_DROPDOWN_OPTIONS = [
      {value: NO, label: "No"},
      {value: YES_CDO, label: "Yes, Code.org scholarship"},
      {value: YES_OTHER, label: "Yes, other scholarship"}
    ]
  end
end
