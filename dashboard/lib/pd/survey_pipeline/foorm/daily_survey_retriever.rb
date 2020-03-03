module Pd::SurveyPipeline
  class Foorm::DailySurveyRetriever
    # Retrieve all survey submissions and questions for a workshop.
    #
    # @param workshop_id [Integer]
    # @return [Array<Enumerable>, nil] An array of 3 enumerable: Enumerable<Foorm::Form>,
    #   Enumerable<Foorm::Submission> and Enumerable<Pd::WorkshopSurveyFoormSubmission>.
    #   Returns nil if the input workshop_id is nil.
    #
    def self.retrieve_all_workshop_surveys(workshop_id)
      return unless workshop_id

      ws_submissions = Pd::WorkshopSurveyFoormSubmission.where(pd_workshop_id: workshop_id)

      submission_ids = ws_submissions.pluck(:foorm_submission_id)
      foorm_submissions = submission_ids.empty? ? [] : Foorm::Submission.find(id: submission_ids)
      form_names_versions = foorm_submissions.pluck(:form_name, :form_version).uniq
      forms = []
      form_names_versions.each do |name, version|
        form = Foorm::Form.where(name: name, version: version)
        forms << form if form
      end
    end
  end
end
