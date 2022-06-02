module Api::V1::Pd::Application
  class TeacherApplicationsController < Api::V1::Pd::FormsController
    include Pd::Application::ApplicationConstants
    include Pd::Application::ActiveApplicationModels

    load_and_authorize_resource class: TEACHER_APPLICATION_CLASS.name, instance_name: 'application'

    def new_form
      @application = TEACHER_APPLICATION_CLASS.new(
        user: current_user
      )
    end

    # PATCH /api/v1/pd/application/teacher/<applicationId>
    def update
      form_data_hash = params[:form_data]
      if form_data_hash
        form_data_json = form_data_hash.to_unsafe_h.to_json.strip_utf8mb4
        @application.form_data_hash = JSON.parse(form_data_json)
      end

      status = params[:status]
      previous_status = @application.status
      if status
        @application.status = status
      end

      if @application.save
        render json: @application, status: :ok

        # send confirmation email only if user is submitting their application for the first time
        on_successful_create if previous_status == 'incomplete' && status == 'unreviewed'
      else
        return render json: {errors: @application.errors.full_messages}, status: :bad_request
      end
    end

    def send_principal_approval
      if @application.allow_sending_principal_email?
        @application.queue_email :principal_approval, deliver_now: true
      end
      render json: {principal_approval: @application.principal_approval_state}
    end

    def principal_approval_not_required
      @application.update!(principal_approval_not_required: true)
      render json: {principal_approval: @application.principal_approval_state}
    end

    protected

    def on_successful_create
      @application.on_successful_create
      @application.update_status_timestamp_change_log(current_user)
    end
  end
end
