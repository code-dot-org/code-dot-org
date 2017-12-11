class Api::V1::Pd::ApplicationsController < ::ApplicationController
  load_and_authorize_resource class: 'Pd::Application::ApplicationBase'

  # This must be included after load_and_authorize_resource so the auth callback runs first
  include Api::CsvDownload

  REGIONAL_PARTNERS_ALL = "all"
  REGIONAL_PARTNERS_NONE = "none"

  # GET /api/v1/pd/applications?regional_partner_filter=:regional_partner_filter
  # :regional_partner_filter can be "all", "none", or a regional_partner_id
  def index
    regional_partner_filter = params[:regional_partner_filter]
    application_data = empty_application_data

    ROLES.each do |role|
      apps = get_applications_by_role(role).group(:status)
      if regional_partner_filter == REGIONAL_PARTNERS_NONE
        apps = apps.where(regional_partner_id: nil)
      elsif regional_partner_filter && regional_partner_filter != REGIONAL_PARTNERS_ALL
        apps = apps.where(regional_partner_id: regional_partner_filter)
      end
      apps.count.each do |status, count|
        application_data[role][status] = count
      end
    end

    render json: application_data
  end

  # GET /api/v1/pd/applications/1
  def show
    render json: @application, serializer: Api::V1::Pd::ApplicationSerializer
  end

  # GET /api/v1/pd/applications/quick_view?role=:role
  def quick_view
    role = params[:role].to_sym
    applications = get_applications_by_role(role)

    respond_to do |format|
      format.json do
        render json: applications, each_serializer: Api::V1::Pd::ApplicationQuickViewSerializer
      end
      format.csv do
        course = role[0..2] # course is the first 3 characters in role, e.g. 'csf'
        csv_text = [TYPES_BY_ROLE[role].csv_header(course), *applications.map(&:to_csv_row)].join
        send_csv_attachment csv_text, "#{role}_applications.csv"
      end
    end
  end

  # PATCH /api/v1/pd/applications/1
  def update
    @application.update(application_params)

    render json: @application, serializer: Api::V1::Pd::ApplicationSerializer
  end

  private

  def get_applications_by_role(role)
    applications_of_type = @applications.where(type: TYPES_BY_ROLE[role].try(&:name))
    case role
    when :csf_facilitators
      return applications_of_type.csf
    when :csd_facilitators
      return applications_of_type.csd
    when :csp_facilitators
      return applications_of_type.csp
    when :csd_teachers
      return applications_of_type.csd
    when :csp_teachers
      return applications_of_type.csp
    else
      raise ActiveRecord::RecordNotFound
    end
  end

  def application_params
    params.require(:application).permit(
      :status, :notes, :response_scores
    )
  end

  TYPES_BY_ROLE = {
    csf_facilitators: Pd::Application::Facilitator1819Application,
    csd_facilitators: Pd::Application::Facilitator1819Application,
    csp_facilitators: Pd::Application::Facilitator1819Application,
    csd_teachers: Pd::Application::Teacher1819Application,
    csp_teachers: Pd::Application::Teacher1819Application
  }
  ROLES = TYPES_BY_ROLE.keys

  def empty_application_data
    {}.tap do |app_data|
      TYPES_BY_ROLE.each do |role, app_type|
        app_data[role] = {}
        app_type.statuses.keys.each do |status|
          app_data[role][status] = 0
        end
      end
    end
  end
end
