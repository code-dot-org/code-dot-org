class Api::V1::Pd::ApplicationsController < ::ApplicationController
  load_and_authorize_resource class: 'Pd::Application::ApplicationBase'

  # This must be included after load_and_authorize_resource so the auth callback runs first
  include Api::CsvDownload

  # GET /api/v1/pd/applications
  def index
    regional_partner_id = params[:regional_partner]
    application_data = {}

    {
      csf_facilitator: Pd::Application::Facilitator1819Application.csf,
      csd_facilitator: Pd::Application::Facilitator1819Application.csd,
      csp_facilitator: Pd::Application::Facilitator1819Application.csp,
      csd_teacher: Pd::Application::Teacher1819Application.csd,
      csp_teacher: Pd::Application::Teacher1819Application.csp,
    }.each do |role, applications|
      applications = applications.where(regional_partner: regional_partner_id) if regional_partner_id
      apps_by_status = applications.select(:status, :locked_at).group_by(&:status)
      application_data[role] = {}
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
    render json: @application, serializer: Api::V1::Pd::ApplicationSerializer
  end

  # GET /api/v1/pd/applications/quick_view/csf_facilitators
  def quick_view
    role = params[:role].to_sym
    return render_404 unless SCOPE_BY_ROLE.key?(role)
    applications = get_applications_by_role(role)
    render json: applications, each_serializer: Api::V1::Pd::ApplicationQuickViewSerializer
  end

  # PATCH /api/v1/pd/applications/1
  def update
    @application.update(application_params)

    render json: @application, serializer: Api::V1::Pd::ApplicationSerializer
  end

  private

  SCOPE_BY_ROLE = {
    csf_facilitators: 'csf',
    csd_facilitators: 'csd',
    csp_facilitators: 'csp',
    csd_teachers: 'csd',
    csp_teachers: 'csp'
  }

  def get_applications_by_role(role)
    @applications.send(SCOPE_BY_ROLE[role])
  end

  def application_params
    params.require(:application).permit(
      :status, :notes
    )
  end
end
