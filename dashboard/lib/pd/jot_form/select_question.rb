module Pd
  module JotForm
    class SelectQuestion < QuestionWithOptions
      def self.supported_types
        [
          TYPE_DROPDOWN,
          TYPE_RADIO,
          TYPE_CHECKBOX,
        ]
      end

      # JotForm designates the "other" option with this key.
      # Other question keys are numbered.
      OTHER_ANSWER_KEY = 'other'.freeze

      attr_accessor(
        :allow_other,
        :other_text,
        :preserve_text
      )

      def self.from_jotform_question(jotform_question)
        super.tap do |select_question|
          select_question.options = jotform_question['options']&.split('|')&.map(&:strip)
          raise KeyError, "Missing options in #{jotform_question}" unless select_question.options

          select_question.allow_other = jotform_question['allowOther'] == 'Yes'
          select_question.other_text = jotform_question['otherText'] if select_question.allow_other
        end
      end

      def to_h
        super.merge(
          allow_other: allow_other,
          other_text: other_text,
          preserve_text: preserve_text
        )
      end

      def answer_type
        if type == TYPE_CHECKBOX
          ANSWER_MULTI_SELECT
        elsif allow_other || preserve_text
          ANSWER_SELECT_TEXT
        else
          # We can only assume a numeric value for single-select (dropdown/radio),
          # without an "other" option, and not explicitly set to preserve text.
          ANSWER_SELECT_VALUE
        end
      end

      def get_value(answer)
        # The jotform answer is a hash whenever the "other" option is selected
        if answer.is_a? Hash
          raise "Expected a single value or array answer, not hash for question #{id}" unless allow_other

          # Hash includes other, in form {'0' => value1, '1' => value2, ..., 'other' => otherText}.
          # Note "other" can be chosen and blank, in which case we use the other text from the question.
          values_with_other = answer.map {|k, v| k == OTHER_ANSWER_KEY ? v.presence || other_text : v}

          # It might be a single item or an array
          return answer_type == ANSWER_MULTI_SELECT ? values_with_other : values_with_other.first
        end

        return answer unless answer_type == ANSWER_SELECT_VALUE

        index = options.index(answer)
        unless index
          raise "Unrecognized answer '#{answer}' for question #{id} (Options: #{options.to_csv.strip})"
        end

        # Return a 1-based value
        index + 1
      end

      # @override
      def type_specific_summary
        answer_type == ANSWER_SELECT_VALUE ? {max_value: options.length} : {}
      end
    end
  end
end
