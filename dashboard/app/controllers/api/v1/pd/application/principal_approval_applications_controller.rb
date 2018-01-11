module Api::V1::Pd::Application
  class PrincipalApprovalApplicationsController < Api::V1::Pd::FormsController
    def new_form
      @application = Pd::Application::PrincipalApproval1819Application.new(
        # current_user may not exist but might as well record it
        user: current_user,
        application_guid: params.require(:application_guid)
      )
    end

    protected

    def on_successful_create
      # Approval application created, now score corresponding teacher application
      teacher_application = Pd::Application::Teacher1819Application.find_by!(application_guid: @application.application_guid)
      principal_response = @application.sanitize_form_data_hash

      teacher_application.update_form_data_hash(
        {
          principal_approval: principal_response.values_at(:do_you_approve, :do_you_approve_other).compact.join(" "),
          schedule_confirmed: principal_response.values_at(:committed_to_master_schedule, :committed_to_master_schedule_other).compact.join(" "),
          diversity_recruitment: principal_response.values_at(:committed_to_diversity, :committed_to_diversity_other).compact.join(" "),
          free_lunch_percent: principal_response[:free_lunch_percent],
          underrepresented_minority_percent: @application.underrepresented_minority_percent.to_s,
          wont_replace_existing_course: principal_response.values_at(:replace_course, :replace_course_other).compact.join(" "),
          can_pay_fee: principal_response[:pay_fee]
        }
      )
      teacher_application.save
      teacher_application.auto_score!

      ::Pd::Application::Teacher1819ApplicationMailer.principal_approval_received(
        @application.teacher_application
      ).deliver_now
    end
  end
end
