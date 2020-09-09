module Api::V1::Pd
  class ApplicationsController < ::ApplicationController
    load_and_authorize_resource class: 'Pd::Application::ApplicationBase'

    include Pd::Application::ActiveApplicationModels

    # Api::CsvDownload must be included after load_and_authorize_resource so the auth callback runs first
    include Api::CsvDownload
    include Pd::Application::ApplicationConstants
    include Pd::SharedApplicationConstants

    REGIONAL_PARTNERS_ALL = "all"
    REGIONAL_PARTNERS_NONE = "none"

    # GET /api/v1/pd/applications?regional_partner_value=:regional_partner_value
    # :regional_partner_value can be "all", "none", or a regional_partner_id
    def index
      regional_partner_value = params[:regional_partner_value]
      application_data = empty_application_data

      ROLES.each do |role|
        # count(locked_at) counts the non-null values in the locked_at column
        apps = get_applications_by_role(role, include_associations: false).
          select(:status, "count(locked_at) AS locked, count(id) AS total").
          group(:status)

        if regional_partner_value == REGIONAL_PARTNERS_NONE
          apps = apps.where(regional_partner_id: nil)
        elsif regional_partner_value && regional_partner_value != REGIONAL_PARTNERS_ALL
          apps = apps.where(regional_partner_id: regional_partner_value)
        end

        apps.group(:status).each do |group|
          application_data[role][group.status] = if ['csd_teachers', 'csp_teachers'].include? role
                                                   {total: group.total}
                                                 else
                                                   {total: group.total, locked: group.locked}
                                                 end
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

    # GET /api/v1/pd/applications/quick_view?role=:role&regional_partner_filter=:regional_partner_filter
    def quick_view
      role = params[:role].to_sym
      applications = get_applications_by_role(role)

      unless params[:regional_partner_value].blank? || params[:regional_partner_value] == REGIONAL_PARTNERS_ALL
        applications = applications.where(regional_partner_id: params[:regional_partner_value] == REGIONAL_PARTNERS_NONE ? nil : params[:regional_partner_value])
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
          csv_text = get_csv_text applications, role
          send_csv_attachment csv_text, "#{role}_applications.csv"
        end
      end
    end

    # GET /api/v1/pd/applications/cohort_view?role=:role&regional_partner_value=:regional_partner
    def cohort_view
      role = params[:role]
      regional_partner_value = params[:regional_partner_value]

      applications = get_applications_by_role(role.to_sym).where(status: COHORT_VIEW_STATUSES)

      unless regional_partner_value.nil? || regional_partner_value == REGIONAL_PARTNERS_ALL
        applications = applications.where(regional_partner_id: regional_partner_value == REGIONAL_PARTNERS_NONE ? nil : regional_partner_value)
      end

      serializer =
        if TYPES_BY_ROLE[role.to_sym] == FACILITATOR_APPLICATION_CLASS
          FacilitatorApplicationCohortViewSerializer
        elsif TYPES_BY_ROLE[role.to_sym] == TEACHER_APPLICATION_CLASS
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
        format.csv do
          csv_text = get_csv_text applications, role
          send_csv_attachment csv_text, "#{role}_cohort_applications.csv"
        end
      end
    end

    # GET /api/v1/pd/applications/fit_cohort
    def fit_cohort
      serialized_fit_cohort = FACILITATOR_APPLICATION_CLASS.fit_cohort(@applications).map do |application|
        FitCohortViewSerializer.new(application, scope: {view: 'fit'}).attributes
      end

      render json: serialized_fit_cohort
    end

    # PATCH /api/v1/pd/applications/1
    def update
      application_data = application_params.to_h

      if application_data[:status] != @application.status
        status_changed = true
      end

      if application_data[:fit_workshop_id] != @application.try(:fit_workshop_id)
        fit_workshop_changed = true
      end

      if application_data[:pd_workshop_id] != @application.pd_workshop_id
        summer_workshop_changed = true
      end

      if @application.application_type == TEACHER_APPLICATION && application_data[:scholarship_status] != @application.scholarship_status
        scholarship_status_changed = true
      end
      scholarship_status = application_data.delete(:scholarship_status)

      if application_data[:response_scores]
        application_data[:response_scores] = JSON.parse(application_data[:response_scores]).transform_keys {|x| x.to_s.underscore}.to_json
      end

      if application_data[:regional_partner_value] == REGIONAL_PARTNERS_NONE
        application_data[:regional_partner_value] = nil
      end

      if application_data.key? :regional_partner_value
        application_data["regional_partner_id"] = application_data.delete "regional_partner_value"
      end

      %w(notes notes_2 notes_3 notes_4 notes_5).each do |notes_field|
        application_data[notes_field] = application_data[notes_field].strip_utf8mb4 if application_data[notes_field]
      end

      %w(question_1 question_2 question_3 question_4 question_5 question_6 question_7).each do |interview_field|
        application_data[interview_field] = application_data[interview_field].strip_utf8mb4 if application_data[interview_field]
      end

      # only allow those with full management permission to lock/unlock and edit form data
      if current_user.workshop_admin?
        if current_user.workshop_admin? && application_admin_params.key?(:locked)
          # only current facilitator applications can be locked/unlocked
          if @application.application_type == FACILITATOR_APPLICATION
            # explicitly convert locked variable to boolean in case it is passed into this function as string
            locked_param = ActiveModel::Type::Boolean.new.cast(application_admin_params[:locked])

            if locked_param != @application.locked?
              lock_changed = true
              locked_param ? @application.lock! : @application.unlock!
            end
          end
        end

        @application.form_data_hash = application_admin_params[:form_data] if application_admin_params.key?(:form_data)
      end

      unless @application.update(application_data)
        return render status: :bad_request, json: {errors: @application.errors.full_messages}
      end

      @application.update_scholarship_status(scholarship_status) if scholarship_status_changed

      @application.update_status_timestamp_change_log(current_user) if status_changed
      @application.log_fit_workshop_change(current_user) if fit_workshop_changed
      @application.log_summer_workshop_change(current_user) if summer_workshop_changed
      @application.update_lock_change_log(current_user) if lock_changed

      render json: @application, serializer: ApplicationSerializer
    end

    # DELETE /api/v1/pd/applications/1
    def destroy
      @application.destroy
    end

    # GET /api/v1/pd/applications/search
    def search
      email = params[:email]
      user = User.find_by_email email
      filtered_applications = @applications.where(
        application_year: APPLICATION_CURRENT_YEAR,
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
        return applications_of_type.csd.where(application_year: APPLICATION_CURRENT_YEAR)
      when :csp_teachers
        return applications_of_type.csp.where(application_year: APPLICATION_CURRENT_YEAR)
      else
        raise ActiveRecord::RecordNotFound
      end
    end

    def application_params
      params.require(:application).permit(
        :status,
        :notes,
        :notes_2,
        :notes_3,
        :notes_4,
        :notes_5,
        :question_1,
        :question_2,
        :question_3,
        :question_4,
        :question_5,
        :question_6,
        :question_7,
        :regional_partner_value,
        :response_scores,
        :pd_workshop_id,
        :fit_workshop_id,
        :scholarship_status
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
      csf_facilitators: FACILITATOR_APPLICATION_CLASS,
      csd_facilitators: FACILITATOR_APPLICATION_CLASS,
      csp_facilitators: FACILITATOR_APPLICATION_CLASS,
      csd_teachers: TEACHER_APPLICATION_CLASS,
      csp_teachers: TEACHER_APPLICATION_CLASS
    }
    ROLES = TYPES_BY_ROLE.keys

    def empty_application_data
      {}.tap do |app_data|
        TYPES_BY_ROLE.each do |role, app_type|
          app_data[role] = {}
          app_type.statuses.each do |status|
            app_data[role][status] = {
              total: 0,
              locked: 0
            }
          end
        end
      end
    end

    def get_csv_text(applications, role)
      prefetch applications, role: role
      course = role.to_s.split('_').first # course is the first part of role, e.g. 'csf'

      [
        TYPES_BY_ROLE[role.try(&:to_sym)].csv_header(course),
        *applications.map {|a| a.to_csv_row(course)}
      ].join
    end

    def get_optional_columns(_regional_partner_value)
      {registered_workshop: false}
    end

    def prefetch_and_serialize(applications, role: nil, serializer:, scope: {})
      prefetch applications, role: role
      applications.map do |application|
        serializer.new(application, scope: scope).attributes
      end
    end

    def prefetch(applications, role: nil)
      type = TYPES_BY_ROLE[role.try(&:to_sym)]
      type.prefetch_associated_models applications
    end
  end
end
