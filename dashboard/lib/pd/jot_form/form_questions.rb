# Collection of Questions for a form
# The Question classes can directly parse JotForm API data via Translation
# This Question data can be stored and retrieved from our DB, and used to process JotForm answers
# also directly from JotForm's API via Translation
module Pd
  module JotForm
    class FormQuestions
      attr_reader :form_id

      def initialize(form_id, questions)
        @form_id = form_id
        @questions_by_id = questions.index_by {|q| q.id.to_i}
      end

      # Construct from an array of serialized questions (hashes)
      # @param form_id [Integer]
      # @param serialized_questions [Array<Hash>]
      def self.deserialize(form_id, serialized_questions)
        questions = serialized_questions.map do |question_hash|
          sanitized_question_hash = question_hash.symbolize_keys
          question_type = sanitized_question_hash[:type]
          Translation.get_question_class_for(question_type).new(sanitized_question_hash)
        end

        new(form_id, questions)
      end

      # Serialize the questions as an array of question hashes
      # @see Question::to_h
      def serialize
        @questions_by_id.values.map(&:to_h)
      end

      # @param id [Integer]
      # @raise [KeyError]
      # @returns [Question]
      def get_question_by_id(id)
        question = @questions_by_id[id.to_i]
        raise KeyError, "No question exists for id #{id} in form #{form_id}" unless question
        question
      end

      # Constructs a form-question summary, a hash of
      #   {question_name => {text:, answer_type:}}
      # Note: matrix questions are expanded into their sub-questions,
      #   so the resulting summary may contain more items than the original list.
      # See #Question::to_summary
      def to_summary
        {}.tap do |summary|
          @questions_by_id.values.sort_by(&:order).each do |question|
            summary.merge! question.to_summary
          end
        end
      end

      # Constructs form_data for answer_data (translated from a JotForm submission),
      #   based on these questions.
      # @return [Hash] {question_id => answer_data (format depends on the question type)}
      # @see Question#to_form_data
      def to_form_data(answers_data)
        questions_with_form_data = answers_data.map do |question_id, answer_data|
          question = get_question_by_id(question_id)
          raise "Unrecognized question id #{question_id} in #{form_id}.#{submission_id}" unless question

          {
            question: question,
            form_data: question.to_form_data(answer_data)
          }
        end

        questions_with_form_data.
          sort_by {|d| d[:question].order}.
          map {|d| d[:form_data]}.
          reduce({}) {|form_data, question_form_data_part| form_data.merge(question_form_data_part)}
      end
    end
  end
end
