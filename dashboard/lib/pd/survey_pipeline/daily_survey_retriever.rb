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
    def get_surveys_by_workshop_and_form(workshop_ids, form_ids)
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
  end
end
