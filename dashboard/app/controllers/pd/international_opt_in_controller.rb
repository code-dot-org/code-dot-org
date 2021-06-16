class Pd::InternationalOptInController < ApplicationController
  load_resource :international_opt_in, class: 'Pd::InternationalOptIn', id_param: :contact_id, only: [:thanks]

  # GET /pd/international_workshop
  def new
    return render '/pd/application/teacher_application/logged_out' unless current_user
    return render '/pd/application/teacher_application/not_teacher' unless current_user.teacher?
    return render '/pd/application/teacher_application/no_teacher_email' unless current_user.email.present?

    @unit_data = {
      props: {
        options: Pd::InternationalOptIn.options.camelize_keys,
        accountEmail: current_user.email,
        apiEndpoint: "/api/v1/pd/international_opt_ins",
        labels: Pd::InternationalOptIn.labels
      }.to_json
    }
  end
end
