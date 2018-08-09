# Matrix questions consist of a heading followed by multiple sub-questions in a grid,
# one question per row (radio buttons), and options as columns
#
# It looks something like this, for example:
# +------------------------------------------------------------------------------------+
# |How much do you agree or disagree with the following statements about this workshop?|
# +------------------------------------------------------------------------------------+
# |                            +----------------------------+                          |
# |                            | Disagree | Neutral | Agree |                          |
# +---------------------------------------------------------+                          |
# |I learned something         |     O    |    O    |   O   |                          |
# +---------------------------------------------------------+                          |
# |It was a good use of time   |     O    |    O    |   O   |                          |
# +---------------------------------------------------------+                          |
# |I enjoyed it                |     O    |    O    |   O   |                          |
# +----------------------------+----------+---------+-------+--------------------------+
#
# This has 3 sub_questions: ['I learned something', 'It was a good use of time', 'I enjoyed it']
# And 3 options: ['Disagree', 'Neutral', 'Agree'], each of which will compute to a numeric value,
# 1-3 from left to right.
#
# Note: JotForm has the ability to provide calculateValues,
# but we are not using that to keep it simple.
module Pd
  module JotForm
    class MatrixQuestion < QuestionWithOptions
      def self.supported_types
        [
          TYPE_MATRIX
        ]
      end

      attr_accessor :sub_questions

      def self.from_jotform_question(jotform_question)
        super.tap do |matrix_question|
          matrix_question.options = jotform_question['mcolumns'].split('|').map(&:strip)
          matrix_question.sub_questions = jotform_question['mrows'].split('|')
        end
      end

      def to_h
        super.merge(
          sub_questions: sub_questions
        )
      end

      def get_value(answer)
        raise "Unable to process matrix answer: #{answer}" unless answer.is_a? Hash

        # Matrix answer is a Hash of sub_question => string_answer
        # Validate each answer and convert each key to sub_question_index
        answer.reject {|_, v| v.blank?}.map do |sub_question, sub_answer|
          sub_question_index = sub_questions.index(sub_question)
          raise "Unable to find sub-question '#{sub_question}' in matrix question #{id}" unless sub_question_index

          raise "Unable to find '#{sub_answer}' in the options for matrix question #{id}" unless options.include? sub_answer

          # Return a 1-based value
          [sub_question_index, sub_answer]
        end.to_h
      end

      def summarize
        sub_questions.each_with_index.map do |sub_question, i|
          [
            generate_sub_question_key(i),
            {
              parent: name,
              max_value: options.length,
              text: "#{text} #{sub_question}",
              answer_type: answer_type,
              options: options
            }
          ]
        end.to_h
      end

      def process_answer(answer)
        # Prefix the matrix name to each sub question key
        get_value(answer).transform_keys {|sub_question_index| generate_sub_question_key(sub_question_index)}
      end

      def generate_sub_question_key(sub_question_index)
        "#{name}_#{sub_question_index}"
      end

      # @override
      def answer_type
        ANSWER_SINGLE_SELECT
      end
    end
  end
end
