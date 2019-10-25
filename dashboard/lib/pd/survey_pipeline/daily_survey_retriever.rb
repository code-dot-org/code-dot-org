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

    # Retrieve facilitator-specific survey submissions and questions for selected facilitators and workshops.
    #
    # @param facilitator_ids [Array<Integer>] non-empty list of facilitator ids
    # @param ws_ids [Array<Integer>] non-empty list of workshop ids
    # @return [Hash] {:facilitator_submissions, :survey_questions => Array}
    #
    def self.retrieve_facilitator_surveys(facilitator_ids, ws_ids)
      submissions = Pd::WorkshopFacilitatorDailySurvey.where(
        facilitator_id: facilitator_ids, pd_workshop_id: ws_ids
      )
      form_ids = submissions.pluck(:form_id).uniq
      questions = Pd::SurveyQuestion.where(form_id: form_ids)

      [questions, submissions]
    end

    # Retrieve general workshop survey submissions and questions for selected workshops.
    #
    # @param ws_ids [Array<number>] non-empty list of workshop ids
    # @return [Hash] {:workshop_submissions, :survey_questions => Array}
    #
    def self.retrieve_general_workshop_surveys(ws_ids)
      submissions = Pd::WorkshopDailySurvey.where(pd_workshop_id: ws_ids)
      form_ids = submissions.pluck(:form_id).uniq
      questions = Pd::SurveyQuestion.where(form_id: form_ids)

      [questions, submissions]
    end
  end
end
