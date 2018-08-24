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
      ::Pd::Application::PrincipalApproval1819Application.create_placeholder_and_send_mail(
        Pd::Application::Teacher1819Application.find(params[:id])
      )
    end

    protected

    def on_successful_create
      @application.auto_score!
      @application.assign_default_workshop!
      @application.update_user_school_info!

      TEACHER_APPLICATION_MAILER_CLASS.confirmation(@application).deliver_now

      unless @application.regional_partner&.applications_principal_approval == RegionalPartner::SELECTIVE_APPROVAL
        ::Pd::Application::PrincipalApproval1819Application.create_placeholder_and_send_mail(@application)
      end
    end
  end
end
