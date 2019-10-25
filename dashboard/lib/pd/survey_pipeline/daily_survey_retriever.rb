module Pd::SurveyPipeline
  class DailySurveyRetriever
    # Retrieve all survey submissions and questions of a workshop.
    #
    # @param workshop_id [Integer]
    # @return [Array<Array>, nil] An array of 3 arrays: Array<Pd::SurveyQuestion>,
    #   Array<Pd::WorkshopDailySurvey> and Array<Pd::WorkshopFacilitatorDailySurvey>.
    #   Returns nil if input workshop_id is nil.
    #
    def self.retrieve_all_workshop_surveys(workshop_id)
      return [] unless workshop_id

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
  end
end
