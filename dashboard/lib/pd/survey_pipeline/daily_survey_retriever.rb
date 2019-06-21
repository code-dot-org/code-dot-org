require_relative 'retriever.rb'

module Pd::SurveyPipeline
  class DailySurveyRetriever < RetrieverBase
    attr_reader :workshop_ids, :form_ids

    # TODO: explain input param, raise.

    # Retrieve data from Pd::SurveyQuestion, Pd::WorkshopDailySurvey
    # and Pd::WorkshopFacilitatorDailySurvey.
    #
    # @param context [Hash{:filters}]
    #
    # @return [Hash{:survey_questions, :workshop_submissions, :facilitator_submissions => Array}]
    #   contains arrays of questions and submissions.
    #
    # @raise
    #
    # @note This function modifies content of input parameter.
    def self.retrieve_data(context)
      raise "Missing required input key :filters" unless context.key?(:filters)

      workshop_ids = context.dig(:filters, :workshop_ids)
      form_ids = context.dig(:filters, :form_ids)

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

      # Create output keys if not exist
      context[:survey_questions] ||= []
      context[:workshop_submissions] ||= []
      context[:facilitator_submissions] ||= []

      context[:survey_questions] += questions
      context[:workshop_submissions] += ws_submissions
      context[:facilitator_submissions] += facilitator_submissions

      context
    end
  end
end
