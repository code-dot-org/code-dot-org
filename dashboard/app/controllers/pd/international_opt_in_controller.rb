class Pd::InternationalOptInController < ApplicationController
  before_action :authenticate_user!, :ensure_teacher!, :ensure_teacher_email!, only: [:new]
  load_resource :international_opt_in, class: 'Pd::InternationalOptIn', id_param: :contact_id, only: [:thanks]

  # GET /pd/international_workshop
  def new
    @script_data = {
      props: {
        options: Pd::InternationalOptIn.options.camelize_keys,
        accountEmail: current_user.email,
        apiEndpoint: "/api/v1/pd/international_opt_ins",
        labels: Pd::InternationalOptIn.labels
      }.to_json
    }
  end

  private def authenticate_user!
    render '/pd/application/teacher_application/logged_out' unless current_user
  end

  private def ensure_teacher!
    render '/pd/application/teacher_application/not_teacher' unless current_user.teacher?
  end

  private def ensure_teacher_email!
    render '/pd/application/teacher_application/no_teacher_email' if current_user.email.blank?
  end
end
