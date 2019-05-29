require_relative 'retriever.rb'

module Pd::SurveyPipeline
  class DailySurveyRetriever < RetrieverBase
    attr_reader :workshop_ids, :form_ids

    # Set filters for this retriever.
    # @param workshop_ids [Array<Integer>] array of selected workshop ids
    # @param form_ids [Array<Integer>] array of selected form ids
    def initialize(workshop_ids: nil, form_ids: nil)
      @workshop_ids = workshop_ids
      @form_ids = form_ids
    end

    # Retrieve data from Pd::SurveyQuestion, Pd::WorkshopDailySurvey
    # and Pd::WorkshopFacilitatorDailySurvey.
    # @return [Hash{:survey_questions, :workshop_submissions, :facilitator_submissions => Array}]
    #   contains arrays of questions and submissions.
    def retrieve_data
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
