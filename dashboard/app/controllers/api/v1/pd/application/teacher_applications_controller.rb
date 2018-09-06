module Api::V1::Pd::Application
  class TeacherApplicationsController < Api::V1::Pd::FormsController
    authorize_resource :teacher_application, class: 'Pd::Application::Teacher1819Application'

    def new_form
      @application = Pd::Application::Teacher1819Application.new(
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

      ::Pd::Application::Teacher1819ApplicationMailer.confirmation(@application).deliver_now

      unless @application.regional_partner&.principal_approval == RegionalPartner::SELECTIVE_APPROVAL
        ::Pd::Application::PrincipalApproval1819Application.create_placeholder_and_send_mail(@application)
      end
    end
  end
end
