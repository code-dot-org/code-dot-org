module Pd::SurveyPipeline
  class DailySurveyRetriever < SurveyPipelineWorker
    REQUIRED_INPUT_KEYS = [:filters]
    OUTPUT_KEYS = [:survey_questions, :workshop_submissions, :facilitator_submissions]

    # @param context [Hash] contains necessary input for this worker to process.
    #   Results are added back to the context object.
    #
    # @return [Hash] the same context object.
    #
    # @raise [RuntimeError] if required input keys are missing.
    #
    def self.process_data(context)
      check_required_input_keys REQUIRED_INPUT_KEYS, context

      results = retrieve_data context.slice(*REQUIRED_INPUT_KEYS)

      OUTPUT_KEYS.each do |key|
        context[key] ||= []
        context[key] += results[key]
      end

      context
    end

    # Retrieve data from Pd::SurveyQuestion, Pd::WorkshopDailySurvey
    # and Pd::WorkshopFacilitatorDailySurvey.
    #
    # @param filters [Hash{:workshop_ids, :form_ids => Array<Integer>}] contains array of selected
    #   workshop ids form ids.
    #
    # @return [Hash{:survey_questions, :workshop_submissions, :facilitator_submissions => Array}]
    #   contains arrays of questions and submissions.
    #
    def self.retrieve_data(filters:)
      workshop_ids = filters[:workshop_ids]
      form_ids = filters[:form_ids]

      # Build where clause from filter values
      submission_filter = {}
      submission_filter[:pd_workshop_id] = workshop_ids if workshop_ids.present?
      submission_filter[:form_id] = form_ids if form_ids.present?

      # Collect submissions
      ws_submissions = Pd::WorkshopDailySurvey.where(submission_filter)
      facilitator_submissions = Pd::WorkshopFacilitatorDailySurvey.where(submission_filter)

      # Collect survey questions; ignore forms that don't have submissions.
      form_ids_with_submissions =
        ws_submissions.pluck(:form_id).uniq | facilitator_submissions.pluck(:form_id).uniq

      questions = form_ids_with_submissions.empty? ? []
        : Pd::SurveyQuestion.where(form_id: form_ids_with_submissions)

      {
        survey_questions: questions,
        workshop_submissions: ws_submissions,
        facilitator_submissions: facilitator_submissions
      }
    end
  end
end
