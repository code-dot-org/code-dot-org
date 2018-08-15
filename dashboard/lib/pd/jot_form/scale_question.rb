module Pd
  module JotForm
    class ScaleQuestion < QuestionWithOptions
      def self.supported_types
        [
          TYPE_SCALE
        ]
      end

      attr_accessor :values

      def self.from_jotform_question(jotform_question)
        super.tap do |scale_question|
          from = jotform_question['scaleFrom'].to_i
          to = jotform_question['scaleAmount'].to_i
          scale_question.values = (from..to).to_a

          scale_question.options = [
            jotform_question['fromText'],
            jotform_question['toText']
          ]
        end
      end

      def to_h
        super.merge(
          values: values
        )
      end

      def get_value(answer)
        numeric_answer = answer.to_i
        unless values.include?(numeric_answer)
          raise "Unrecognized answer #{numeric_answer} for question #{id} (Range: #{values.first}..#{values.last})"
        end

        numeric_answer
      end

      # @override
      def type_specific_summary
        augmented_options = values.map(&:to_s)
        augmented_options[0] = "#{augmented_options[0]} - #{options.first}"
        augmented_options[-1] = "#{augmented_options[-1]} - #{options.last}"

        {
          min_value: values.first,
          max_value: values.last,
          options: augmented_options
        }
      end

      # @override
      def answer_type
        ANSWER_SCALE
      end
    end
  end
end
