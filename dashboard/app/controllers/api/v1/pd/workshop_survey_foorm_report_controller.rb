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
