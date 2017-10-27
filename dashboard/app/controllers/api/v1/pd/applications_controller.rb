class Api::V1::Pd::ApplicationsController < ::ApplicationController
  load_and_authorize_resource class: 'Pd::Application::ApplicationBase'

  # This must be included after load_and_authorize_resource so the auth callback runs first
  include Api::CsvDownload

  # GET /api/v1/pd/applications
  def index
    application_data = empty_application_data

    ROLES.each do |role|
      applications = get_applications_by_role(role)
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

  # GET /api/v1/pd/applications/quick_view/csf_facilitators
  def quick_view
    role = params[:role].to_sym
    applications = get_applications_by_role(role)
    return render_404 unless applications
    render json: applications, each_serializer: Api::V1::Pd::ApplicationQuickViewSerializer
  end

  # PATCH /api/v1/pd/applications/1
  def update
    @application.update(application_params)

    render json: @application, serializer: Api::V1::Pd::ApplicationSerializer
  end

  private

  def get_applications_by_role(role)
    case role
    when :csf_facilitators
      return @applications.csf.where(type: Pd::Application::Facilitator1819Application.name)
    when :csd_facilitators
      return @applications.csd.where(type: Pd::Application::Facilitator1819Application.name)
    when :csp_facilitators
      return @applications.csp.where(type: Pd::Application::Facilitator1819Application.name)
    when :csd_teachers
      return @applications.csd.where(type: Pd::Application::Teacher1819Application.name)
    when :csp_teachers
      return @applications.csp.where(type: Pd::Application::Teacher1819Application.name)
    else
      nil
    end
  end

  def application_params
    params.require(:application).permit(
      :status, :notes
    )
  end

  ROLES = [
    :csf_facilitators,
    :csd_facilitators,
    :csp_facilitators,
    :csd_teachers,
    :csp_teachers
  ]

  def empty_application_data
    {}.tap do |app_data|
      ROLES.each do |role|
        app_data[role] = {}
        Pd::Application::ApplicationBase.statuses.keys.each do |status|
          app_data[role][status] = 0
        end
      end
    end
  end
end
