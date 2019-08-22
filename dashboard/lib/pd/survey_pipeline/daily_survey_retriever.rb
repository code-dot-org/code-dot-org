module Pd::SurveyPipeline
  module DailySurveyRetriever
    # Retrieve data from Pd::SurveyQuestion, Pd::WorkshopDailySurvey
    # and Pd::WorkshopFacilitatorDailySurvey using workshop and form filters.
    #
    # @param workshop_ids [Array<Integer>]
    # @param form_ids [Array<Integer>]
    #
    # @return [Array(survey_questions, workshop_submissions, facilitator_submissions)]
    #
    def retrieve_surveys_by_workshop_and_form(workshop_ids, form_ids)
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

      [questions, ws_submissions, facilitator_submissions]
    end

    # Retrieve facilitator submissions and survey questions for selected facilitators and workshops.
    #
    # @param facilitator_ids [Array<number>] non-empty list of facilitator ids
    # @param ws_ids [Array<number>] non-empty list of workshop ids
    #
    # @return [Array(questions, submissions)]
    #
    def retrieve_facilitator_surveys(facilitator_ids, ws_ids)
      submissions = Pd::WorkshopFacilitatorDailySurvey.where(
        facilitator_id: facilitator_ids, pd_workshop_id: ws_ids
      )
      form_ids = submissions.pluck(:form_id).uniq
      questions = Pd::SurveyQuestion.where(form_id: form_ids)

      [questions, submissions]
    end

    # Retrieve workshop daily submissions and survey questions for selected workshops.
    #
    # @param ws_ids [Array<number>] non-empty list of workshop ids
    #
    # @return [Array(questions, submissions)]
    #
    def retrieve_workshop_surveys(ws_ids)
      submissions = Pd::WorkshopDailySurvey.where(pd_workshop_id: ws_ids)
      form_ids = submissions.pluck(:form_id).uniq
      questions = Pd::SurveyQuestion.where(form_id: form_ids)

      [questions, submissions]
    end
  end
end
