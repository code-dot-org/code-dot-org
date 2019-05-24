module Pd::SurveyPipeline
  class RetrieverBase
    def retrive_data(*)
      raise 'Must override in derived class'
    end
  end

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
    # @return [Hash{survey_questions, workshop_surveys, facilitator_surveys}]
    #   a hash contains questions and submissions
    def retrieve_data(logger: nil)
      logger&.info "RE: workshop_ids filter = #{workshop_ids}"
      logger&.info "RE: form_ids filter = #{form_ids}"

      # Build where clause from filter values
      submission_filter = {}
      submission_filter[:pd_workshop_id] = workshop_ids if workshop_ids.present?
      submission_filter[:form_id] = form_ids if form_ids.present?

      # Collect submissions
      ws_submissions = Pd::WorkshopDailySurvey.where(submission_filter)
      facilitator_submissions = Pd::WorkshopFacilitatorDailySurvey.where(submission_filter)

      logger&.info "RE: ws_submissions.count = #{ws_submissions.count}"
      logger&.debug "RE: ws_submissions = #{ws_submissions&.inspect}"
      logger&.info "RE: facilitator_submissions.count = #{facilitator_submissions.count}"
      logger&.debug "RE: facilitator_submissions = #{facilitator_submissions&.inspect}"

      # Collect survey questions, ignore form that doesn't have submission.
      form_ids_with_submissions =
        ws_submissions.pluck(:form_id).uniq | facilitator_submissions.pluck(:form_id).uniq

      question_filter = {}
      question_filter[:form_id] = form_ids_with_submissions if form_ids_with_submissions.present?
      questions = Pd::SurveyQuestion.where(question_filter)

      logger&.info "RE: questions.count = #{questions.count}"
      logger&.debug "RE: questions = #{questions&.inspect}"

      {
        survey_questions: questions,
        workshop_surveys: ws_submissions,
        facilitator_surveys: facilitator_submissions
      }
    end
  end
end
