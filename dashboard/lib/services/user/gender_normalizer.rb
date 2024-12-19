module Services
  module User
    class GenderNormalizer < Services::Base
      include ::Policies::Gender::MatchingPatterns
      include ::Policies::Gender::NormalizedValues

      attr_reader :raw_input

      def initialize(raw_input:)
        @raw_input = raw_input
      end

      def call
        return nil if raw_input.blank?
        lowercase_gender = raw_input.strip.downcase
        if matches_any?(NON_BINARY_REGEXES, lowercase_gender)
          NON_BINARY
        elsif matches_any?(MALE_REGEXES, lowercase_gender)
          MALE
        elsif matches_any?(FEMALE_REGEXES, lowercase_gender)
          FEMALE
        else
          OTHER
        end
      end

      private def matches_any?(patterns, str)
        patterns.any? {|regex| str.match?(regex)}
      end
    end
  end
end
