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
        @questions_by_name = questions.index_by(&:name)
      end

      def question_ids
        @questions_by_id.keys
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

      # @param name [String]
      # @raise [KeyError]
      # @returns [Question]
      def get_question_by_name(name)
        question = @questions_by_name[name]
        raise KeyError, "No question exists for name '#{name}' in form #{form_id}" unless question
        question
      end

      def [](id_or_name)
        get_question_by_id_or_name(id_or_name)
      end

      def get_question_by_id_or_name(id_or_name)
        if id_or_name.to_i.to_s == id_or_name
          get_question_by_id id_or_name
        else
          get_question_by_name id_or_name
        end
      end

      # Constructs a form-question summary, a hash of
      #   {question_name => {text:, answer_type:}}
      # Note: matrix questions are expanded into their sub-questions,
      #   so the resulting summary may contain more items than the original list.
      # See #Question::summarize
      # @param show_hidden_questions [Boolean] optional, default false
      def summarize(show_hidden_questions: false)
        {}.tap do |summary|
          @questions_by_id.values.sort_by(&:order).each do |question|
            next if question.hidden? && !show_hidden_questions
            summary.merge! question.summarize
          end
        end
      end

      # Constructs form_data for answer_data (translated from a JotForm submission),
      #   based on these questions.
      # @param answers_data [Hash] {question_id => answer_data (format depends on the question type)}
      # @param show_hidden_questions [Boolean] optional, default false
      # @return [Hash] {question_name => answer_data}, sorted by appearance order in the form
      # @see Question#process_answers
      def process_answers(answers_data, show_hidden_questions: false)
        questions_with_form_data = answers_data.filter_map do |question_id, answer_data|
          question = get_question_by_id_or_name(question_id)
          raise "Unrecognized question id #{question_id}" unless question

          next if question.hidden? && !show_hidden_questions

          form_data = begin
            question.process_answer(answer_data)
          rescue => exception
            raise exception, "Error processing answer #{question_id}: #{exception.message}", exception.backtrace
          end

          {
            question: question,
            form_data: form_data
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
