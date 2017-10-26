class Api::V1::Pd::ApplicationsController < ::ApplicationController
  load_and_authorize_resource class: 'Pd::Application::ApplicationBase'

  # GET /api/v1/pd/applications
  def index
    application_data = {}
    regional_partner_id = params[:regional_partner]

    {
      csf_facilitator: Pd::Application::Facilitator1819Application.csf,
      csd_facilitator: Pd::Application::Facilitator1819Application.csd,
      csp_facilitator: Pd::Application::Facilitator1819Application.csp,
      csd_teacher: Pd::Application::Teacher1819Application.csd,
      csp_teacher: Pd::Application::Teacher1819Application.csp,
    }.each do |role, applications|
      application_data[role] = {}
      applications = applications.where(regional_partner: regional_partner_id) if regional_partner_id
      apps_by_status = applications.group_by(&:status)
      apps_by_status.each do |status, apps_with_status|
        application_data[role][status] = {}
        grouped_apps = apps_with_status.group_by {|app| app.locked? ? 'locked' : 'unlocked'}
        grouped_apps.each do |locked_state, apps|
          application_data[role][status][locked_state] = apps.size
        end
      end
    end

    render json: application_data
  end

  # GET /api/v1/pd/applications/1
  def show
    render json: @application, each_serializer: Api::V1::Pd::ApplicationSerializer
  end

  # GET /api/v1/pd/applications/quick_view/csf_facilitators
  def quick_view
    role = params[:role].to_sym
    applications = APPLICATION_TYPES[role]
    render json: applications, each_serializer: Api::V1::Pd::ApplicationQuickViewSerializer
  end

  # PATCH /api/v1/pd/applications/1
  def update
    @application.update(application_params)

    render json: @application, serializer: Api::V1::Pd::ApplicationSerializer
  end

  private

  APPLICATION_TYPES = {
    csf_facilitators: Pd::Application::Facilitator1819Application.csf,
    csd_facilitators: Pd::Application::Facilitator1819Application.csd,
    csp_facilitators: Pd::Application::Facilitator1819Application.csp,
    csd_teachers: Pd::Application::Teacher1819Application.csd,
    csp_teachers: Pd::Application::Teacher1819Application.csp,
  }

  def application_params
    params.require(:application).permit(
      :status, :notes
    )
  end
end
