module Api::V1::Pd::Application
  class TeacherApplicationsController < Api::V1::Pd::FormsController
    include Pd::Application::ApplicationConstants
    include Pd::TeacherApplicationConstants
    include Pd::Application::ActiveApplicationModels

    load_and_authorize_resource class: TEACHER_APPLICATION_CLASS.name, instance_name: 'application'

    def new_form
      @application = TEACHER_APPLICATION_CLASS.new(
        user: current_user
      )
    end

    def new_status
      # Do not modify status if the principal approval has already been completed.
      return if @application.principal_approval_state&.include?(PRINCIPAL_APPROVAL_STATE[:complete])

      return 'incomplete' if ActiveModel::Type::Boolean.new.cast(params[:isSaving])

      regional_partner_id = @application.form_data_hash['regionalPartnerId']

      return 'awaiting_admin_approval' unless regional_partner_id

      no_admin_approval = RegionalPartner.find(regional_partner_id)&.applications_principal_approval == RegionalPartner::SELECTIVE_APPROVAL
      no_admin_approval ? 'unreviewed' : 'awaiting_admin_approval'
    end

    # PATCH /api/v1/pd/application/teacher/<applicationId>
    def update
      form_data_hash = params[:form_data]
      if form_data_hash
        form_data_json = form_data_hash.to_unsafe_h.to_json.strip_utf8mb4
        @application.form_data_hash = JSON.parse(form_data_json)
      end

      previous_status = @application.status
      @application.status = new_status

      if @application.save
        render json: @application, status: :ok

        # send confirmation email only if user is submitting their application for the first time
        on_successful_create if previous_status == 'incomplete' && @application.status_on_submit?
      else
        render json: {errors: @application.errors.full_messages}, status: :bad_request
      end
    end

    def send_principal_approval
      if @application.allow_sending_principal_email?
        @application.send_pd_application_email :admin_approval
      end
      render json: {principal_approval: @application.principal_approval_state}
    end

    def change_principal_approval_requirement
      @application.update!(principal_approval_not_required: params[:principal_approval_not_required].to_bool)
      @application.send_pd_application_email :admin_approval if @application.allow_sending_principal_email?
      render json: {principal_approval: @application.principal_approval_state}
    end

    protected

    def on_successful_create
      @application.on_successful_create
      @application.update_status_timestamp_change_log(current_user)
    end
  end
end
