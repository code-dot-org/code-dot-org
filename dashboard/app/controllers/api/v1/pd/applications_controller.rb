module Api::V1::Pd
  class ApplicationsController < ::ApplicationController
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
        # count(locked_at) counts the non-null values in the locked_at column
        apps = get_applications_by_role(role, include_associations: false).
          select(:status, "count(locked_at) AS locked, count(id) AS total").
          group(:status)

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
      serialized_application = ApplicationSerializer.new(
        @application,
        scope: {raw_form_data: params[:raw_form_data]}
      ).attributes

      render json: serialized_application
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
          serialized_applications = prefetch_and_serialize(
            applications,
            role: role,
            serializer: ApplicationQuickViewSerializer
          )
          render json: serialized_applications
        end
        format.csv do
          prefetch applications, role: role
          course = role[0..2] # course is the first 3 characters in role, e.g. 'csf'
          csv_text = [
            TYPES_BY_ROLE[role].csv_header(course, current_user),
            *applications.map {|a| a.to_csv_row(current_user)}
          ].join
          send_csv_attachment csv_text, "#{role}_applications.csv"
        end
      end
    end

    # GET /api/v1/pd/applications/cohort_view?role=:role&regional_partner_filter=:regional_partner
    def cohort_view
      role = params[:role]
      regional_partner_filter = params[:regional_partner_filter]
      applications = get_applications_by_role(role.to_sym).where(status: ['accepted', 'withdrawn'])

      unless regional_partner_filter.nil? || regional_partner_filter == 'all'
        applications = applications.where(regional_partner_id: regional_partner_filter == 'none' ? nil : regional_partner_filter)
      end

      serializer =
        if TYPES_BY_ROLE[role.to_sym] == Pd::Application::Facilitator1819Application
          FacilitatorApplicationCohortViewSerializer
        elsif TYPES_BY_ROLE[role.to_sym] == Pd::Application::Teacher1819Application
          TeacherApplicationCohortViewSerializer
        end

      respond_to do |format|
        format.json do
          serialized_applications = prefetch_and_serialize(
            applications,
            role: role,
            serializer: serializer,
            scope: {user: current_user}
          )
          render json: serialized_applications
        end
        prefetch applications, role: role
        format.csv do
          csv_text = [TYPES_BY_ROLE[role.to_sym].cohort_csv_header, applications.map(&:to_cohort_csv_row)].join
          send_csv_attachment csv_text, "#{role}_cohort_applications.csv"
        end
      end
    end

    # GET /api/v1/pd/applications/teachercon_cohort
    def teachercon_cohort
      applications = Pd::Application::WorkshopAutoenrolledApplication.teachercon_cohort(@applications)

      serialized_applications = prefetch_and_serialize(
        applications,
        serializer: TcFitCohortViewSerializer,
        scope: {view: 'teachercon'}
      )

      serialized_tc_registrations = Pd::Teachercon1819Registration.
        where(pd_application_id: nil).
        includes(user: {school_info: {school: :school_district}}).map do |registration|
        TcFitCohortViewTeacherconRegistrationSerializer.new(registration, scope: {view: 'teachercon'}).attributes
      end

      render json: serialized_applications + serialized_tc_registrations
    end

    # GET /api/v1/pd/applications/fit_cohort
    def fit_cohort
      serialized_fit_cohort = Pd::Application::Facilitator1819Application.fit_cohort(@applications).map do |application|
        TcFitCohortViewSerializer.new(application, scope: {view: 'fit'}).attributes
      end

      render json: serialized_fit_cohort
    end

    # PATCH /api/v1/pd/applications/1
    def update
      application_data = application_params

      if application_data[:response_scores]
        JSON.parse(application_data[:response_scores]).transform_keys {|x| x.to_s.underscore}.to_json
      end

      if application_data[:regional_partner_filter] == REGIONAL_PARTNERS_NONE
        application_data[:regional_partner_filter] = nil
      end
      application_data["regional_partner_id"] = application_data.delete "regional_partner_filter"

      application_data["notes"] = application_data["notes"].strip_utf8mb4 if application_data["notes"]

      # only allow those with full management permission to lock/unlock and edit form data
      if current_user.workshop_admin?
        if current_user.workshop_admin? && application_admin_params.key?(:locked)
          application_admin_params[:locked] ? @application.lock! : @application.unlock!
        end

        @application.form_data_hash = application_admin_params[:form_data] if application_admin_params.key?(:form_data)
      end

      unless @application.update(application_data)
        return render status: :bad_request, json: {errors: @application.errors.full_messages}
      end

      render json: @application, serializer: ApplicationSerializer
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

      serialized_applications = filtered_applications.map {|a| ApplicationSearchSerializer.new(a).attributes}
      render json: serialized_applications
    end

    private

    def get_applications_by_role(role, include_associations: true)
      applications_of_type = @applications.where(type: TYPES_BY_ROLE[role].try(&:name))
      applications_of_type = applications_of_type.includes(:user, :regional_partner) if include_associations
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
        :status,
        :notes,
        :regional_partner_filter,
        :response_scores,
        :pd_workshop_id,
        :fit_workshop_id
      )
    end

    def application_admin_params
      params.require(:application).tap do |application_params|
        application_params.permit(:locked)

        # Permit form_data: and everything under it
        application_params.permit(:form_data).permit!
      end
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

    def prefetch_and_serialize(applications, role: nil, serializer:, scope: {})
      prefetch applications, role: role
      applications.map do |application|
        serializer.new(application, scope: scope).attributes
      end
    end

    def prefetch(applications, role: nil)
      type = TYPES_BY_ROLE[role.try(&:to_sym)] || Pd::Application::WorkshopAutoenrolledApplication
      type.prefetch_associated_models applications
    end
  end
end
