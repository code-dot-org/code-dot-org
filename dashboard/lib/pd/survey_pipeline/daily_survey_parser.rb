require_relative 'transformer.rb'

module Pd::SurveyPipeline
  class DailySurveyParser < TransformerBase
    include Pd::JotForm::Constants

    # Parse input records into hashes.
    #
    # @param survey_questions [Array<Pd::SurveyQuestion>]
    # @param workshop_submissions [Array<Pd::WorkshopDailySurvey>]
    # @param facilitator_submissions [Array<Pd::WorkshopFacilitatorDailySurvey>]
    #
    # @return [Hash{:questions, :submissions => Hash}]
    #   @see output of parse_survey and parse_submissions for the structures of those hash values.
    def self.transform_data(survey_questions:, workshop_submissions:, facilitator_submissions:)
      raise 'Invalid input parameter' unless survey_questions &&
        workshop_submissions && facilitator_submissions

      # Parse questions in surveys
      questions = parse_survey(survey_questions)

      # Parse submissions
      workshop_submissions = parse_submissions(workshop_submissions)
      facilitator_submissions = parse_submissions(facilitator_submissions)

      {questions: questions, submissions: workshop_submissions.merge(facilitator_submissions)}
    end

    # Parse an array of submissions into hashes.
    #
    # @param survey_submissions [Array<Pd::WorkshopDailySurvey or Pd::WorkshopFacilitatorDailySurvey>]
    #
    # @return [Hash{form_id => {submission_id => submission_content}}]
    #   submission_content is Hash{:user_id, :pd_session_id, :pd_workshop_id, :day, :answers =>
    #     String, Hash}
    #   submission_content[:answer] is Hash{qid => answer_content}.
    #   answer_content is Array<Hash{:text, :answer => String}> for matrix question, and string
    #   for other question types.
    def self.parse_submissions(survey_submissions)
      parsed_submissions = {}

      survey_submissions&.each do |submission|
        submission_content = {
          workshop_id: submission.pd_workshop_id,
          session_id: submission.pd_session_id,
          day: submission.day,
          user_id: submission.user_id,
          # This attribute may not exist in all submission. It returns nil if not found.
          facilitator_id: submission[:facilitator_id],
          answers: {}
        }

        # answers field in submission from Pd::WorkshopDailySurvey or
        # Pd::WorkshopFacilitatorDailySurvey is Hash{qid_string => answer_string}.
        # answer_string in multi-select questions such as matrix is actually
        # a Hash{sub_question_text => sub_answer}.
        JSON.parse(submission.answers || '{}').each_pair do |qid, ans|
          if ans.is_a? Hash
            submission_content[:answers][qid] = []

            # Save sub answers as an array of Hash{:text, :answer => string}
            ans.each_pair do |sub_q, sub_answer|
              submission_content[:answers][qid] << {
                text: sub_q,
                answer: sub_answer
              }
            end
          else
            # Keep the original answer, which is a single string
            submission_content[:answers][qid] = ans
          end
        end

        # Create mapping from form_id => submission_id => submission_content
        parsed_submissions[submission.form_id] ||= {}
        parsed_submissions[submission.form_id][submission.submission_id] = submission_content
      end

      parsed_submissions
    end

    # Parse an array of form questions into hashes.
    #
    # @param survey_questions [Array<Pd::SurveyQuestion>]
    #
    # @return [Hash{form_id => {question_id => question_content}}]
    #   question_content is Hash{:type, :name, :text, :order, :hidden}.
    #   It could also have question-specific keys such as :options, :sub_questions etc.
    def self.parse_survey(survey_questions)
      parsed_questions = {}

      # questions field in Pd::SurveyQuestion is an array of hashes, with each hash is
      # content of a question.
      # E.g. "[{'id': 1, 'type': 'number', 'name': 'overallRating', 'text': 'Overall Rating'}"]
      survey_questions&.each do |sq|
        parsed_questions[sq.form_id] ||= {}

        JSON.parse(sq.questions).each do |question|
          question.symbolize_keys!

          # Map question options to numbers
          if question[:options]
            question[:option_map] = question[:options].each_with_index.
              map {|x, i| [x, i + 1]}.
              to_h
          end

          question[:answer_type] = QUESTION_TO_ANSWER_TYPES[question[:type]] || ANSWER_UNKNOWN

          # Create mapping form_id => question_id => question_content.
          # Convert question[:id] to string to match with question id in submission.
          parsed_questions[sq.form_id][question[:id].to_s] = question.except(:id)
        end
      end

      parsed_questions
    end
  end
end
