class Api::V1::Pd::ApplicationsController < ::ApplicationController
  load_and_authorize_resource class: 'Pd::Application::ApplicationBase'

  # GET /api/v1/pd/applications
  def index
    application_data = empty_application_data
    regional_partner_id = params[:regional_partner]

    APPLICATION_TYPES.each do |role, applications|
      applications = applications.where(regional_partner: regional_partner_id) if regional_partner_id
      apps_by_status = applications.group_by(&:status)
      apps_by_status.each do |status, apps_with_status|
        application_data[role][status] = apps_with_status.size
      end
    end

    render json: application_data
  end

  # GET /api/v1/pd/applications/1
  def show
    render json: @application, serializer: Api::V1::Pd::ApplicationSerializer
  end

  # PATCH /api/v1/pd/applications/1
  def update
    @application.update(application_params)

    render json: @application, serializer: Api::V1::Pd::ApplicationSerializer
  end

  private

  def application_params
    params.require(:application).permit(
      :status, :notes
    )
  end

  APPLICATION_TYPES = {
    csf_facilitators: Pd::Application::Facilitator1819Application.csf,
    csd_facilitators: Pd::Application::Facilitator1819Application.csd,
    csp_facilitators: Pd::Application::Facilitator1819Application.csp,
    csd_teachers: Pd::Application::Teacher1819Application.csd,
    csp_teachers: Pd::Application::Teacher1819Application.csp,
  }

  def empty_application_data
    {}.tap do |app_data|
      APPLICATION_TYPES.keys.each do |role|
        app_data[role] = {}
        Pd::Application::ApplicationBase.statuses.keys.each do |status|
          app_data[role][status] = 0
        end
      end
    end
  end
end
