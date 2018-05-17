module Pd
  module JotForm
    class MatrixQuestion < QuestionWithOptions
      def self.supported_types
        [
          TYPE_MATRIX
        ]
      end

      attr_accessor :sub_questions

      def self.from_jotform_question(id:, type:, jotform_question:)
        super.tap do |matrix_question|
          matrix_question.options = jotform_question['mcolumns'].split('|')
          matrix_question.sub_questions = jotform_question['mrows'].split('|')
        end
      end

      def to_h
        super.merge(
          sub_questions: sub_questions
        )
      end

      def get_value(answer)
        # Matrix answer is a Hash of sub_question => string_answer
        answer.map do |sub_question, sub_answer|
          sub_question_index = sub_questions.index(sub_question)
          raise "Unable to find sub-question '#{sub_question}' in matrix question #{id}" unless sub_question_index

          sub_answer_index = options.index(sub_answer)
          raise "Unable to find '#{sub_answer}' in the options for matrix question #{id}" unless sub_answer_index

          # Return a 1-based value
          [sub_question_index, sub_answer_index + 1]
        end.to_h
      end

      def to_summary
        sub_questions.each_with_index.map do |sub_question, i|
          [
            generate_sub_question_key(i),
            {
              text: sub_question,
              answer_type: ANSWER_SELECT_VALUE
            }
          ]
        end.to_h
      end

      def to_form_data(answer)
        # Prefix the matrix name to each sub question key
        get_value(answer).transform_keys {|sub_question_index| generate_sub_question_key(sub_question_index)}
      end

      def generate_sub_question_key(sub_question_index)
        "#{name}_#{sub_question_index}"
      end
    end
  end
end
