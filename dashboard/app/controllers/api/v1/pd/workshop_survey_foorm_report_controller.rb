module Api::V1::Pd
  class WorkshopSurveyFoormReportController < ReportControllerBase
    include Pd::Foorm

    # GET /api/v1/pd/workshops/:id/foorm/generic_survey_report
    def generic_survey_report
      is_authorized, facilitator_id_filter = get_authorization_and_filter(current_user, params[:workshop_id])
      return render json: {}, status: 401 unless is_authorized
      report = Pd::Foorm::SurveyReporter.get_workshop_report(params[:workshop_id], facilitator_id_filter)
      render json: report
    end

    # GET /api/v1/pd/workshops/:id/foorm/csv_survey_report
    def csv_survey_report
      return render json: {}, status: 401 unless current_user && current_user.workshop_admin?
      form_name = params[:name]
      form_version = params[:version]
      workshop_id = params[:workshop_id]
      ws_submissions = Pd::WorkshopSurveyFoormSubmission.where(pd_workshop_id: workshop_id)
      submission_ids = ws_submissions.pluck(:foorm_submission_id)
      form = ::Foorm::Form.where(name: form_name, version: form_version).first
      foorm_submissions = submission_ids.empty? ?
                            ::Foorm::Submission.none :
                            ::Foorm::Submission.where(id: submission_ids, form_name: form_name, form_version: form_version)

      filename = "#{form_name}_submissions.csv"
      csv = form.submissions_to_csv(foorm_submissions)
      send_csv_attachment(csv, filename)
    end

    # GET /api/v1/pd/workshops/:id/foorm/forms_for_workshop
    def forms_for_workshop
      ws_submissions = Pd::WorkshopSurveyFoormSubmission.where(pd_workshop_id: params[:workshop_id])
      submission_ids = ws_submissions.pluck(:foorm_submission_id)
      foorm_submissions = submission_ids.empty? ? [] : ::Foorm::Submission.find(submission_ids)
      form_names_versions = foorm_submissions.pluck(:form_name, :form_version).uniq
      result = []
      form_names_versions.each do |name, version|
        result << {name: name, version: version}
      end
      render json: result
    end

    # Check if an user can see a summary result and return a filter
    # if a filter is required for the user
    # @param user [User] current user requesting this report
    # @param workshop_id [Integer]
    # @return [Boolean, Integer/nil]
    #   Boolean: if the user is authorized to view this workshop's results.
    #   Integer: will be non-nil if the results need to be filtered to only show data for this user id.
    def get_authorization_and_filter(user, workshop_id)
      return [false, nil] unless user
      return [true, nil] if user.program_manager? ||
        user.workshop_organizer? ||
        user.workshop_admin?

      workshop = Pd::Workshop.find(workshop_id)
      # Only other user authorized to view this workshop besides those checked above is a
      # facilitator for this workshop. If this user is a facilitator for this workshop,
      # add a filter to only show data for this user.
      return [workshop.facilitator_ids.include?(user.id), user.id]
    end
  end
end
