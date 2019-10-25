module Pd::SurveyPipeline
  class DailySurveyRetriever
    # Retrieve all survey submissions and questions for a workshop.
    #
    # @param workshop_id [Integer]
    # @return [Array<Array>, nil] An array of 3 arrays: Array<Pd::SurveyQuestion>,
    #   Array<Pd::WorkshopDailySurvey> and Array<Pd::WorkshopFacilitatorDailySurvey>.
    #   Returns nil if input workshop_id is nil.
    #
    def self.retrieve_all_workshop_surveys(workshop_id)
      return unless workshop_id

      # Collect submissions
      ws_submissions = Pd::WorkshopDailySurvey.where(pd_workshop_id: workshop_id)
      facilitator_submissions = Pd::WorkshopFacilitatorDailySurvey.where(pd_workshop_id: workshop_id)

      # Collect survey questions; ignore forms that don't have submissions.
      form_ids_with_submissions =
        ws_submissions.pluck(:form_id).uniq | facilitator_submissions.pluck(:form_id).uniq

      questions = form_ids_with_submissions.empty? ? []
        : Pd::SurveyQuestion.where(form_id: form_ids_with_submissions)

      [questions, ws_submissions, facilitator_submissions]
    end

    # Retrieve facilitator-specific survey submissions and questions for a facilitator
    # in a selected list of workshops.
    #
    # @param facilitator_id [Integer]
    # @param workshop_ids [Array<Integer>] non-empty list of workshop ids
    # @return [Array<Array>, nil] An array of 2 arrays: Array<Pd::SurveyQuestion> and
    #   Array<Pd::WorkshopFacilitatorDailySurvey>.
    #   Returns nil if either of the input parameter is nil.
    #
    def self.retrieve_facilitator_surveys(facilitator_id, workshop_ids)
      return unless facilitator_id && workshop_ids

      submissions = Pd::WorkshopFacilitatorDailySurvey.where(
        facilitator_id: facilitator_id, pd_workshop_id: workshop_ids
      )
      form_ids = submissions.pluck(:form_id).uniq
      questions = Pd::SurveyQuestion.where(form_id: form_ids)

      [questions, submissions]
    end

    # Retrieve general workshop survey submissions and questions for selected workshops.
    #
    # @param workshop_ids [Array<Integer>] non-empty list of workshop ids
    # @return [Array<Array>] An array of 2 arrays: Array<Pd::SurveyQuestion> and
    #   Array<Pd::WorkshopDailySurvey>. Returns nil if the input parameter is nil.
    #
    def self.retrieve_general_workshop_surveys(workshop_ids)
      return unless workshop_ids

      submissions = Pd::WorkshopDailySurvey.where(pd_workshop_id: workshop_ids)
      form_ids = submissions.pluck(:form_id).uniq
      questions = Pd::SurveyQuestion.where(form_id: form_ids)

      [questions, submissions]
    end
  end
end
