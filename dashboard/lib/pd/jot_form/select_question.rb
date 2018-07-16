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
        :preserve_text # kept for backward compatibility
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
        )
      end

      # @override
      def ensure_valid_answer(answer)
        if answer.is_a? Array
          answer.each {|sub_answer| ensure_valid_answer(sub_answer)}
        elsif !options.include? answer
          raise "Unrecognized answer '#{answer}' for question #{id} (Options: #{options.join(',')})"
        end

        answer
      end

      # @override
      def answer_type
        type == TYPE_CHECKBOX ? ANSWER_MULTI_SELECT : ANSWER_SINGLE_SELECT
      end

      def get_value(answer)
        # The jotform answer is a hash whenever the "other" option is selected
        if answer.is_a? Hash
          raise "Expected a single value or array answer, not hash for question #{id}" unless allow_other

          # Hash includes other, in form {'0' => value1, '1' => value2, ..., 'other' => otherText}.
          # Note "other" can be chosen and blank, in which case we use the other text from the question.
          values_with_other = answer.map {|k, v| k == OTHER_ANSWER_KEY ? v.presence || other_text : v}

          # It might be a single item or an array
          return multi_select? ? values_with_other : values_with_other.first
        end

        ensure_valid_answer answer
      end

      # @override
      def type_specific_summary
        {
          options: options,
          other_text: other_text
        }
      end
    end
  end
end
