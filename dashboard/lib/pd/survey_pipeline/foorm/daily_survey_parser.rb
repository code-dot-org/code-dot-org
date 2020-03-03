module Pd::SurveyPipeline
  class Foorm::DailySurveyParser < SurveyPipelineWorker
    REQUIRED_INPUT_KEYS = [:foorm_forms]
    OPTIONAL_INPUT_KEYS = [:foorm_submissions, :workshop_survey_foorm_submissions]
    OUTPUT_KEYS = [:parsed_questions, :parsed_submissions]
    # @param context [Hash] contains necessary input for this worker to process.
    #   Results are added back to the context object.
    #
    # @return [Hash] the same context object.
    #
    # @raise [RuntimeError] if required input keys are missing.
    #
    def self.process_data(context)
      check_required_input_keys REQUIRED_INPUT_KEYS, context

      results = transform_data context.slice(*(REQUIRED_INPUT_KEYS + OPTIONAL_INPUT_KEYS))

      OUTPUT_KEYS.each do |key|
        context[key] ||= {}
        context[key].deep_merge! results[key]
      end

      context
    end

    # Parse input records into hashes.
    #
    # @param foorm_forms [Array<Foorm:Form>]
    # @param foorm_submissions [Array<Foorm:Submission>]
    # @param workshop_survey_foorm_submissions [Array<Pd::WorkshopSurveyFoormSubmission>]
    #
    # @return [Hash{:questions, :submissions => Hash}]
    #
    def self.transform_data(foorm_forms:, foorm_submissions: [], workshop_survey_foorm_submissions: [])
      # may need to add facilitator submissions too
      {
        parsed_questions: parse_questions(foorm_forms),
        parsed_submissions: parse_submissions(workshop_survey_foorm_submissions, foorm_submissions)
      }
    end

    # Parse an array of submissions into hashes.
    #
    # @param workshop_survey_foorm_submissions [Array<Pd::WorkshopSurveyFoormSubmission>]
    # @param foorm_submissions [Array<Foorm:Submission>]
    #
    # @return [Hash{form_id => {submission_id => submission_content}}]
    #   submission_content is Hash{:user_id, :pd_session_id, :pd_workshop_id, :day, :answers =>
    #     String, Hash}
    #   submission_content[:answer] is Hash{qid => answer_content}.
    #   answer_content is Array<Hash{:text, :answer => String}> for matrix question, and string
    #   for other question types.
    #
    def self.parse_submissions(workshop_foorm_submissions, foorm_submissions)
      parsed_submissions = {}

      workshop_foorm_submissions&.each do |submission|
        submission_content = {
          workshop_id: submission.pd_workshop_id,
          session_id: submission.pd_session_id,
          day: submission.day,
          user_id: submission.user_id,
          # This attribute may not exist in all submission. It returns nil if not found.
          # currently don't have facilitator surveys, uncomment when add this
          # facilitator_id: submission[:facilitator_id],
          answers: {}
        }

        # answers field in submission from Foorm:Submission is Hash{qid_string => answer_string}.
        # answer_string in multi-select questions such as matrix is actually
        # a Hash{sub_question_text => sub_answer}.
        # answer_string for checkbox is an array of strings
        foorm_submission_data = foorm_submissions.find(submission.foorm_submission_id)
        JSON.parse(foorm_submission_data.answers || '{}').each_pair do |qid, ans|
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
            # Keep the original answer, which is a single string or array of strings
            submission_content[:answers][qid] = ans
          end
        end

        # Create mapping from form_id => submission_id => submission_content
        parsed_submissions[foorm_submission_data.form_name][foorm_submission_data.form_version] ||= {}
        parsed_submissions[foorm_submission_data.form_name][foorm_submission_data.form_version][submission.foorm_submission_id] = submission_content
      end

      parsed_submissions
    end

    # Parse an array of form questions into hashes.
    #
    # @param survey_questions [Array<Foorm:Form>]
    #
    # @return [Hash] {form_id => {question_id => question_content}}
    #   In which, question_content is Hash{:type, :name, :text, :order, :hidden, :answer_type}.
    #   It could also have question-specific keys such as :options, :option_map and :values.
    #
    def self.parse_questions(survey_questions)
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
