class Api::V1::Pd::ApplicationsController < ::ApplicationController
  load_and_authorize_resource class: 'Pd::Application::ApplicationBase'

  # Api::CsvDownload must be included after load_and_authorize_resource so the auth callback runs first
  include Api::CsvDownload
  include Pd::Application::ApplicationConstants

  REGIONAL_PARTNERS_ALL = "all"
  REGIONAL_PARTNERS_NONE = "none"

  # GET /api/v1/pd/applications?regional_partner_filter=:regional_partner_filter
  # :regional_partner_filter can be "all", "none", or a regional_partner_id
  def index
    regional_partner_filter = params[:regional_partner_filter]
    application_data = empty_application_data

    ROLES.each do |role|
      apps = get_applications_by_role(role).
        select(:status, "IF(locked_at IS NULL, FALSE, TRUE) AS locked", "count(id) AS total").
          group(:status, :locked)

      if regional_partner_filter == REGIONAL_PARTNERS_NONE
        apps = apps.where(regional_partner_id: nil)
      elsif regional_partner_filter && regional_partner_filter != REGIONAL_PARTNERS_ALL
        apps = apps.where(regional_partner_id: regional_partner_filter)
      end

      apps.group(:status).each do |group|
        application_data[role][group.status] = {
          locked: group.locked,
          unlocked: group.total - group.locked
        }
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

    unless params[:regional_partner_filter].blank? || params[:regional_partner_filter] == 'all'
      applications = applications.where(regional_partner_id: params[:regional_partner_filter] == 'none' ? nil : params[:regional_partner_filter])
    end

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

  # GET /api/v1/pd/applications/cohort_view?role=:role&regional_partner_filter=:regional_partner_name
  def cohort_view
    applications = get_applications_by_role(params[:role].to_sym).where(status: 'accepted')

    unless params[:regional_partner_filter].nil? || params[:regional_partner_filter] == 'all'
      applications = applications.where(regional_partner_id: params[:regional_partner_filter] == 'none' ? nil : params[:regional_partner_filter])
    end

    serializer =
      if TYPES_BY_ROLE[params[:role].to_sym] == Pd::Application::Facilitator1819Application
        Api::V1::Pd::FacilitatorApplicationCohortViewSerializer
      elsif TYPES_BY_ROLE[params[:role].to_sym] == Pd::Application::Teacher1819Application
        Api::V1::Pd::TeacherApplicationCohortViewSerializer
      end

    respond_to do |format|
      format.json do
        render json: applications, each_serializer: serializer
      end
      format.csv do
        csv_text = [TYPES_BY_ROLE[params[:role].to_sym].cohort_csv_header, applications.map(&:to_cohort_csv_row)].join
        send_csv_attachment csv_text, "#{params[:role]}_cohort_applications.csv"
      end
    end
  end

  # PATCH /api/v1/pd/applications/1
  def update
    application_data = application_params.except(:locked)

    if application_data[:response_scores]
      JSON.parse(application_data[:response_scores]).transform_keys {|x| x.to_s.underscore}.to_json
    end

    if application_data[:regional_partner_filter] == REGIONAL_PARTNERS_NONE
      application_data[:regional_partner_filter] = nil
    end
    application_data["regional_partner_id"] = application_data.delete "regional_partner_filter"

    application_data["notes"] = application_data["notes"].strip_utf8mb4 if application_data["notes"]

    @application.update!(application_data)

    # only allow those with full management permission to lock or unlock
    if application_params.key?(:locked) && current_user.workshop_admin?
      application_params[:locked] ? @application.lock! : @application.unlock!
    end

    render json: @application, serializer: Api::V1::Pd::ApplicationSerializer
  end

  # GET /api/v1/pd/applications/search
  def search
    email = params[:email]
    user = User.find_by_email email
    filtered_applications = @applications.where(
      application_year: YEAR_18_19,
      application_type: [TEACHER_APPLICATION, FACILITATOR_APPLICATION],
      user: user
    )

    render json: filtered_applications, each_serializer: Api::V1::Pd::ApplicationSearchSerializer
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
      :status, :notes, :regional_partner_filter, :response_scores, :locked, :pd_workshop_id
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
          app_data[role][status] = {
            locked: 0,
            unlocked: 0
          }
        end
      end
    end
  end
end
