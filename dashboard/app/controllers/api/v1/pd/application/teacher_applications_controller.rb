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

    def send_principal_approval
      unless @application.emails.exists?(email_type: 'principal_approval')
        @application.queue_email :principal_approval, deliver_now: true
      end
      render json: {principal_approval: @application.principal_approval}
    end

    def principal_approval_not_required
      @application.update!(principal_approval_not_required: true)
      render json: {principal_approval: @application.principal_approval}
    end

    protected

    def on_successful_create
      @application.update_user_school_info!
      @application.queue_email :confirmation, deliver_now: true
      @application.update_form_data_hash(
        {
          cs_total_course_hours: @application.sanitize_form_data_hash.slice(
            :cs_how_many_minutes,
            :cs_how_many_days_per_week,
            :cs_how_many_weeks_per_year
          ).values.map(&:to_i).reduce(:*) / 60
        }
      )

      @application.auto_score!
      @application.save

      unless @application.regional_partner&.applications_principal_approval == RegionalPartner::SELECTIVE_APPROVAL
        @application.queue_email :principal_approval, deliver_now: true
      end
    end
  end
end
