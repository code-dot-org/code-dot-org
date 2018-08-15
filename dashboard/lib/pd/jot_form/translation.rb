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
        CDO.log.info "Getting JotForm questions for #{@form_id}"
        response = @client.get_questions(@form_id)

        # Content is a hash of question id => question details
        # The question details also contain the id, so we can simply inspect the values
        parse_jotform_questions(response['content'].values)
      end

      # Retrieves new submissions for this form from JotForm's API
      # @param last_known_submission_id [Integer] (optional) - filter to new submissions, since the last known id
      # @param min_date [Date] (optional) (optional) filter to new submissions on or after the min date
      # @return [Hash] with {result_set: {offset, limit, count}, submissions: []}
      #   where submissions is an array of hashes with keys :form_id, :submission_id, :answers
      #   where answers is itself a hash of question ids to raw answers.
      # Note - these answers are incomplete on their own, and need to be combined with the Question objects
      #        (from get_questions above)
      def get_submissions(last_known_submission_id: nil, min_date: nil, limit: 100, offset: 0)
        CDO.log.info "Getting JotForm submissions for #{@form_id} "\
          "last_known_submission_id: #{last_known_submission_id}, min_date: #{min_date},"\
          " limit: #{limit}, offset: #{offset}"

        response = @client.get_submissions(@form_id,
          last_known_submission_id: last_known_submission_id,
          min_date: min_date,
          limit: limit,
          offset: offset
        )

        {
          result_set: response['resultSet'].slice('offset', 'limit', 'count').symbolize_keys,
          submissions: response['content'].map {|s| parse_jotform_submission(s)}
        }
      end

      # Retrieves a specific submission from JotForm's API
      # @param submission_id [Integer]
      # @return [Hash] hash with keys :form_id, :submission_id, :answers
      #   where answers is itself a hash of question ids to raw answers.
      # @see get_submissions
      def get_submission(submission_id)
        response = @client.get_submission submission_id
        parse_jotform_submission response['content']
      end

      # Determine which sub-class of Question will handle parsing a given JotForm question type
      # @param type [String] the part of the JotForm control type string after "control_"
      # @return [Class] sub-class of Question
      # @raise for unrecognized or ignored types
      def self.get_question_class_for(type)
        QUESTION_CLASSES.find {|q| q.supported_types.include?(type)}.tap do |klass|
          raise "Unexpected question type: #{type}" unless klass
        end
      end

      protected

      def parse_jotform_questions(jotform_questions)
        # Questions are in one of several categories:
        # 1. Text replacement, with name ending in '-summary'.
        #    These replace the text of the base named question and are otherwise ignored.
        # 2. One of the ignored types. These will be ignored outright.
        # 3. Everything else will be parsed.

        text_replacements, remaining_questions =
          jotform_questions.partition {|q| q['name'].end_with? '-summary'}

        replacement_text_by_name = text_replacements.
          index_by {|q| q['name'].delete_suffix('-summary')}.
          transform_values {|q| q['text']}

        questions_to_parse =
          remaining_questions.reject {|q| IGNORED_QUESTION_TYPES.include?(get_type(q))}

        questions_to_parse.map do |question|
          parse_jotform_question question, replacement_text_by_name
        end
      end

      # Retrieves the type from a jotform entity (Question or Answer),
      # and removes the common `control_` prefix.
      # @param jotform_entity [Hash]
      # @return [String]
      def get_type(jotform_entity)
        Question.sanitize_type jotform_entity['type']
      end

      # Parses a JotForm question, optionally replacing its text
      # @param jotform_question [Hash] JSON.parsed jotform question
      # @param replacement_text_by_name [Hash] mapping of question name to replacement text where applicable
      def parse_jotform_question(jotform_question, replacement_text_by_name)
        type = get_type(jotform_question)
        sanitized_question_data = jotform_question.merge(
          'type' => type,
          'text' => replacement_text_by_name[jotform_question['name']] || jotform_question['text']
        )

        klass = self.class.get_question_class_for type
        klass.from_jotform_question(sanitized_question_data)
      end

      def parse_jotform_submission(jotform_submission)
        submission_id = jotform_submission['id'].to_i

        # Some entries show up with no answers. Skip those.
        included_answers = jotform_submission['answers'].select do |answer_id, answer_data|
          next false unless answer_data.key? 'answer'

          # We have seen (matrix) answers sometimes show up with a false or null value,
          # and don't know how to interpret those.
          # See https://www.jotform.com/answers/1482175-API-Integration-Matrix-answer-returning-false-in-the-API#1
          if answer_data['answer'] == false || answer_data['answer'].nil?
            # For now, ignore / skip these
            # TODO(Andrew): update after followup with JotForm API support
            CDO.log.warn "Encountered JotForm false or null answer, id #{answer_id} in submission: #{submission_id}"
            next false
          end

          # Skip empty answers
          next false if answer_data['answer'].blank?

          true
        end

        # Answer json is in the form:
        #   question_id => {name, text, type, answer, ...}
        #   All we care about here is the answer.
        answers = included_answers.map do |question_id, answer_data|
          [
            question_id.to_i,
            strip_answer(answer_data['answer'])
          ]
        end.to_h

        {
          form_id: @form_id,
          submission_id: submission_id,
          answers: answers
        }
      end

      # Strip leading and trailing whitespace from each answer
      def strip_answer(answer)
        if answer.is_a? String
          answer.strip
        elsif answer.is_a? Array
          answer.map(&:strip)
        elsif answer.is_a? Hash
          answer.transform_values(&:strip)
        end
      end
    end
  end
end
