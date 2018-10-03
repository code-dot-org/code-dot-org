module Api::V1::Pd::Application
  class TeacherApplicationsController < Api::V1::Pd::FormsController
    include Pd::Application::ApplicationConstants
    include Pd::Application::ActiveApplicationModels

    authorize_resource :teacher_application, class: 'Pd::Application::Teacher1819Application'

    def new_form
      @application = TEACHER_APPLICATION_CLASS.new(
        user: current_user
      )
    end

    def resend_principal_approval
      application = TEACHER_APPLICATION_CLASS.find(params[:id])
      application.queue_email :principal_approval, deliver_now: true
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
      @application.save

      unless @application.regional_partner&.applications_principal_approval == RegionalPartner::SELECTIVE_APPROVAL
        @application.queue_email :principal_approval, deliver_now: true
      end
    end
  end
end
