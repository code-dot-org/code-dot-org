module Pd
  module PrincipalApprovalCommonApplicationConstants
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
  end
end
