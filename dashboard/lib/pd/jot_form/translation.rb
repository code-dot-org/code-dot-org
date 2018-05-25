# Wrapper for JotForm API client, to query questions and submissions,
# parse the data, and translate to our format.
#
# Each instance is associated with a particular form id
module Pd
  module JotForm
    class Translation
      include Constants

      QUESTION_CLASSES = [
        TextQuestion,
        SelectQuestion,
        ScaleQuestion,
        MatrixQuestion
      ].freeze

      # @param [Integer] form_id
      def initialize(form_id)
        @form_id = form_id
        @client = JotFormRestClient.new
      end

      # Retrieves questions for the form from JotForm's API
      # @return [Array<Question>] parsed and formatted Question objects
      def get_questions
        response = @client.get_questions(@form_id)
        # Content is a hash of question id => question details
        # The question details also contain the id, so we can simply inspect the values
        response['content'].values.map {|q| parse_jotform_question(q)}.compact
      end

      # Retrieves new submissions for this form from JotForm's API
      # @param last_known_submission_id [Integer] (optional) - filter to new submissions, since the last known id
      # @return [Array<Hash>] array of hashes with keys :form_id, :submission_id, :answers
      #   where answers is itself a hash of question ids to raw answers.
      # Note - these answers are incomplete on their own, and need to be combined with the Question objects
      #        (from get_questions above)
      def get_submissions(last_known_submission_id: nil)
        response = @client.get_submissions(@form_id, last_known_submission_id: last_known_submission_id)
        response['content'].map {|s| parse_jotform_submission(s)}
      end

      # Determine which sub-class of Question will handle parsing a given JotForm question type
      # @param type [String] the part of the JotForm control type string after "control_"
      # @return [Class, nil] sub-class of Question, or nil for ignored types (button, heading)
      # @raise for unrecognized types
      def self.get_question_class_for(type)
        QUESTION_CLASSES.find {|q| q.supported_types.include?(type)}.tap do |klass|
          raise "Unexpected question type: #{type}" unless klass || IGNORED_QUESTION_TYPES.include?(type)
        end
      end

      protected

      def parse_jotform_question(jotform_question)
        id = jotform_question['qid']
        type = jotform_question['type'].delete_prefix('control_')

        klass = self.class.get_question_class_for type
        return nil unless klass

        klass.from_jotform_question(id: id, type: type, jotform_question: jotform_question)
      end

      def parse_jotform_submission(jotform_submission)
        id = jotform_submission['id'].to_i

        # For some reason, text fields are included in the answers even though there is never an answer.
        # Skip all the ignored types.
        included_answers = jotform_submission['answers'].reject do |_, answer_data|
          IGNORED_QUESTION_TYPES.include? answer_data['type'].delete_prefix('control_')
        end

        # Answer json is in the form:
        #   question_id => {name, text, type, answer, ...}
        #   All we care about here is the answer.
        answers = included_answers.map do |question_id, answer_data|
          [
            question_id.to_i,
            answer_data['answer']
          ]
        end.to_h

        {
          form_id: @form_id,
          submission_id: id,
          answers: answers
        }
      end
    end
  end
end
