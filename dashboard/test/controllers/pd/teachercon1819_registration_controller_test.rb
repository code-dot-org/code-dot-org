require 'test_helper'

class Pd::Teachercon1819RegistrationControllerTest < ::ActionController::TestCase
  setup do
    @teacher = create :teacher
    @application = create :pd_teacher1819_application, :locked, user: @teacher
    @teachercon = create :pd_workshop, :teachercon, num_sessions: 5
    @application.update(pd_workshop_id: @teachercon.id)

    sign_in(@teacher)
  end
  # Signed out teacher gets redirected to sign in

  # Accepted and locked teacher application should get appropriate script data
  test 'Accepted and locked teacher application populates script_data' do
    get :new, params: {
      application_guid: @application.application_guid
    }
    assert_response :success
    assert_equal(
      {
        options: Pd::Teachercon1819Registration.options.camelize_keys,
        requiredFields: Pd::Teachercon1819Registration.camelize_required_fields,
        apiEndpoint: "/api/v1/pd/teachercon_registrations",
        applicationId: @application.id,
        applicationType: @application.application_type,
        course: @application.workshop.course,
        city: @application.workshop.location_city,
        date: @application.workshop.friendly_date_range,
        email: @teacher.email,
        firstName: @application.first_name,
        lastName: @application.last_name,
        phone: @application.sanitize_form_data_hash[:phone]
      }.to_json, assigns(:script_data)[:props]
    )
  end

  # Accepted but unlocked teacher application should be redirected to invalid
  test 'accepted but unlocked teacher application' do
    @application.update(locked_at: nil)
    get :new, params: {
      application_guid: @application.application_guid
    }
    assert_template("invalid")
  end

  # Unaccepted teacher application should be redirected invalid
  test 'Unaccepted teacher application should be redirected to invalid' do
    @application.update_column(:status, 'pending')
    get :new, params: {
      application_guid: @application.application_guid
    }
    assert_template("invalid")
  end

  # Teacher that is not going to teachercon should be redirected to invalid
  test 'Non teachercon teacher should be redirected to invalid' do
    not_teachercon = create :pd_workshop, num_sessions: 5
    @application.update(pd_workshop_id: not_teachercon.id)

    @application.update_column(:status, 'pending')
    get :new, params: {
      application_guid: @application.application_guid
    }
    assert_template("invalid")
  end
end
