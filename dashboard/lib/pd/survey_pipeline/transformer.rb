module Pd::SurveyPipeline
  class TransformerBase
    def transform_data(*)
      raise 'Must override in derived class'
    end
  end

  class DailySurveyParser < TransformerBase
    # TODO: don't create multiple record when parsing, simply just parse string to nested hashes
    # save memory, don't duplicate shared data.

    include Pd::JotForm::Constants

    ANSWER_TYPE_MAPPING = {
      TYPE_NUMBER => ANSWER_TEXT,
      TYPE_TEXTBOX => ANSWER_TEXT,
      TYPE_TEXTAREA => ANSWER_TEXT,
      TYPE_RADIO => ANSWER_SINGLE_SELECT,
      TYPE_DROPDOWN => ANSWER_SINGLE_SELECT,
      TYPE_CHECKBOX => ANSWER_MULTI_SELECT,
      TYPE_MATRIX => ANSWER_MULTI_SELECT,
      TYPE_SCALE => ANSWER_SCALE
    }.freeze

    STRING_DIGEST_LENGTH = 16

    # Parse input data into individual question and answer.
    # @param survey_questions [Array<Pd::SurveyQuestion>]
    # @param workshop_submissions [Array<Pd::WorkshopDailySurvey>]
    # @param facilitator_submissions [Array<Pd::WorkshopFacilitatorDailySurvey>]
    # @return [Hash{Symbol => Array}]
    #   a hash which keys are symbols (:questions, :answers)
    #   and values are arrays of individual questions and answers.
    def transform_data(survey_questions:, workshop_submissions:, facilitator_submissions:, logger: nil)
      # TODO: corner cases: input nil, empty array, big array?

      # Parse questions in surveys
      questions = parse_survey(survey_questions)
      logger&.info "TR: parsed questions count = #{questions.count}"

      # Add inferred info into question (did not get directly from JotForm).
      # And replace key
      questions.each do |question|
        question[:answer_type] = ANSWER_TYPE_MAPPING[question[:type]] || 'unknown'
        question[:qid] = question[:id]
        question.delete(:id)
      end

      # Parse workshop submissions
      # TODO: filter empty answers and hidden questions in the JOIN component or mapper
      submissions = parse_submissions(workshop_submissions)
      submissions += parse_submissions(facilitator_submissions)

      {questions: questions, answers: submissions}
    end

    # @param survey_submissions [Array<Pd::WorkshopDailySurvey or Pd::WorkshopFacilitatorDailySurvey>]
    # @return [Array<Hash>]
    def parse_submissions(survey_submissions)
      parsed_submissions = []

      survey_submissions&.each do |submission|
        # submission is a record in Pd::WorkshopDailySurvey or Pd::WorkshopFacilitatorDailySurvey
        # submission.answers is as hash of {qid => answer}.
        JSON.parse(submission.answers).each_pair do |qid, ans|
          submission_key = {
            workshop_id: submission.pd_workshop_id,
            form_id: submission.form_id,
            submission_id: submission.id,
          }

          # Answer for a matrix question is a hash of {sub_question => sub_answer};
          # break it further to sub answer level.
          if ans.is_a? Hash
            ans.each_pair do |sub_q, sub_answer|
              parsed_submissions << submission_key.merge(
                {
                  qid: compute_descendant_key(qid, sub_q),
                  answer: sub_answer
                }
              )
            end
          else
            parsed_submissions << submission_key.merge(
              {
                qid: qid,
                answer: ans
              }
            )
          end
        end
      end

      parsed_submissions
    end

    # @param survey_questions [Array<Pd::SurveyQuestion>]
    # @return [Array<Hash>]
    def parse_survey(survey_questions)
      parsed_questions = []

      survey_questions&.each do |sq|
        # sq is a record in Pd::SurveyQuestion model.
        # sq.questions is an array of hashes, and each hash is content of a question.
        # E.g. "[{'id': 1, 'type': 'number', 'name': 'overallRating', 'text': 'Overall Rating'}"]
        JSON.parse(sq.questions).each do |question|
          question.symbolize_keys!
          form_key = {form_id: sq.form_id}

          # Matrix question is a collection of sub questions and answer options;
          # break it into multiple sub questions.
          if question[:type] == TYPE_MATRIX
            parse_matrix_question(question).each do |sub_question|
              parsed_questions << form_key.merge(sub_question)
            end
          else
            parsed_questions << form_key.merge(question)
          end
        end
      end

      parsed_questions
    end

    # Parse a matrix question into array of sub questions
    # @param question [Hash]
    # @return [Array<Hash>]
    def parse_matrix_question(question)
      results = []
      question[:sub_questions].each do |sub_q|
        # Replace :id, :name, :text, :type values of a sub question.
        # Keep other keys from the original question, except for :sub_questions key.
        tmp = question.except(:id, :name, :text, :type, :sub_questions)

        tmp[:id] = compute_descendant_key(question[:id], sub_q)
        tmp[:name] = compute_descendant_key(question[:name], sub_q)
        tmp[:text] = "#{question[:text]}->#{sub_q}"
        tmp[:type] = TYPE_RADIO

        # Add specific keys for a sub question
        tmp[:max_value] = question[:options].length
        tmp[:parent] = question[:name]

        results << tmp
      end

      results
    end

    # Compute a descendant key based on original value and sub_value digest
    def compute_descendant_key(value, sub_value)
      "#{value}_#{compute_str_digest(sub_value)}"
    end

    # Compute message digest using SHA256 and cut it to a fixed length.
    def compute_str_digest(str)
      # SHA256 returns a 256-bit digest, which is 64-character string in hex
      Digest::SHA256.hexdigest(str || '')[0, STRING_DIGEST_LENGTH - 1]
    end
  end
end
