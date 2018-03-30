require 'test_helper'

class Pd::Teachercon1819RegistrationControllerTest < ::ActionController::TestCase
  setup do
    @teacher = create :teacher
    @application = create :pd_teacher1819_application, :locked, user: @teacher
    @teachercon = create :pd_workshop, :teachercon, num_sessions: 5
    @application.update(pd_workshop_id: @teachercon.id)
    @regional_partner = RegionalPartner.find_or_create_by(name: 'WNY STEM Hub', group: 3)
    regional_partner_program_manager = create :regional_partner_program_manager,
      regional_partner: @regional_partner
    @program_manager = regional_partner_program_manager.program_manager
    @facilitator = create :facilitator

    @expected_partner_teachercon_registration_script_data = {
      options: Pd::Teachercon1819Registration.options.camelize_keys,
      requiredFields: Pd::Teachercon1819Registration.camelize_required_fields,
      apiEndpoint: "/api/v1/pd/teachercon_partner_registrations",
      regionalPartnerId: @regional_partner.id,
      applicationType: "Partner",
      city: Pd::Application::RegionalPartnerTeacherconMapping::TC_PHOENIX[:city],
      date: Pd::Application::RegionalPartnerTeacherconMapping::TC_PHOENIX[:dates],
      email: @program_manager.email,
    }.to_json

    @expected_lead_facilitator_teacher_registration_script_data = {
      options: Pd::Teachercon1819Registration.options.camelize_keys,
      requiredFields: Pd::Teachercon1819Registration.camelize_required_fields,
      apiEndpoint: "/api/v1/pd/teachercon_lead_facilitator_registrations",
      applicationType: "LeadFacilitator",
      city: Pd::Application::RegionalPartnerTeacherconMapping::TC_PHOENIX[:city],
      date: Pd::Application::RegionalPartnerTeacherconMapping::TC_PHOENIX[:dates],
      email: @facilitator.email,
    }.to_json

    sign_in(@teacher)
  end
  # Signed out teacher gets redirected to sign in
  test_redirect_to_sign_in_for :new, params: -> {{application_guid: @application.application_guid}}

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

  test 'Accepted and locked facilitator application populates script_data' do
    facilitator = create :facilitator
    sign_in(facilitator)
    facilitator_application = create :pd_facilitator1819_application, :locked, user: facilitator
    facilitator_application.update(pd_workshop_id: @teachercon.id)

    get :new, params: {
      application_guid: facilitator_application.application_guid
    }

    assert_response :success
    assert_equal(
      {
        options: Pd::Teachercon1819Registration.options.camelize_keys,
        requiredFields: Pd::Teachercon1819Registration.camelize_required_fields,
        apiEndpoint: "/api/v1/pd/teachercon_registrations",
        applicationId: facilitator_application.id,
        applicationType: facilitator_application.application_type,
        course: facilitator_application.workshop.course,
        city: facilitator_application.workshop.location_city,
        date: facilitator_application.workshop.friendly_date_range,
        email: facilitator.email,
        firstName: facilitator_application.first_name,
        lastName: facilitator_application.last_name,
        phone: facilitator_application.sanitize_form_data_hash[:phone]
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
    get :new, params: {
      application_guid: @application.application_guid
    }
    assert_template("invalid")
  end

  # Partner not signed in should be redirected to please_sign_in
  test 'Not signed in should be directed to please_sign_in page' do
    sign_out(@teacher)

    get :partner, params: {city: 'Phoenix'}
    assert_template('please_sign_in')
  end

  # Partner should redirect to please_sign_in for a non program manager
  test 'Partner for a non program manager should redirect to please_sign_in page' do
    sign_out(@teacher)
    sign_in(create(:facilitator))
    get :partner, params: {city: 'Phoenix'}
    assert_template('please_sign_in')
  end

  # Regional Partner Program Manager not in Group 3 should be redirected
  test 'Program manager not in group 3 should be redirected to only_group_3' do
    sign_out(@teacher)
    regional_partner_program_manager = create :regional_partner_program_manager
    sign_in(regional_partner_program_manager.program_manager)

    get :partner, params: {city: 'Phoenix'}
    assert_template('only_group_3')
  end

  # Not specifying teachercon should redirect to invalid page
  test 'Invalid city in city param should redirect' do
    sign_out(@teacher)
    sign_in(@program_manager)

    get :partner, params: {city: 'Not a city'}
    assert_template('invalid')
  end

  # Program Manager with Group 3 partner should have appropriate script_data set
  test 'Program manager with group 3 partner should have script_data values set' do
    sign_out(@teacher)
    sign_in(@program_manager)

    get :partner, params: {city: 'Phoenix'}
    assert_response :success
    assert_equal @expected_partner_teachercon_registration_script_data, assigns(:script_data)[:props]
  end

  # If a city is not specified, try and figure out the teachercon based on the mapping
  test 'Program manager with group 3 partner assigned to teachercon should have script_data values set even if city is not passed in' do
    sign_out(@teacher)
    sign_in(@program_manager)

    get :partner
    assert_response :success
    assert_equal @expected_partner_teachercon_registration_script_data, assigns(:script_data)[:props]
  end

  # Program Manager with teachercon registration gets redirected to submitted
  test 'Program manager with teachercon registration gets redirected to submitted' do
    sign_out(@teacher)
    sign_in(@program_manager)
    create :pd_teachercon1819_registration, user: @program_manager

    get :partner, params: {city: 'Phoenix'}
    assert_template('partner_submitted')
  end

  # Lead facilitator should have appropriate script_data set
  test 'Lead Facilitator gets appropriate script_data set' do
    sign_in(@facilitator)
    get :lead_facilitator, params: {city: 'Phoenix'}

    assert_equal @expected_lead_facilitator_teacher_registration_script_data,
      assigns(:script_data)[:props]
  end

  # Only facilitators can register with lead_facilitator link
  test 'Only facilitators can register with lead_facilitator link' do
    get :lead_facilitator, params: {city: 'Phoenix'}

    assert_template('unauthorized')
  end

  # Lead facilitators can register for both teachercons
  test 'Lead facilitators can register for both teachercons' do
    sign_in(@facilitator)

    get :lead_facilitator, params: {city: 'Phoenix'}
    assert_equal @expected_lead_facilitator_teacher_registration_script_data,
      assigns(:script_data)[:props]

    registration_hash = build :pd_teachercon1819_registration_hash_common, :lead_facilitator_accepted
    create :pd_teachercon1819_registration, user: @facilitator, form_data: registration_hash.to_json, pd_application: nil
    get :lead_facilitator, params: {city: 'Atlanta'}

    expected_atlanta_hash = JSON.parse @expected_lead_facilitator_teacher_registration_script_data
    expected_atlanta_hash[:city] = 'Atlanta'
    expected_atlanta_hash[:date] = 'June 17 - 22, 2018'

    assert_equal expected_atlanta_hash.to_json, assigns(:script_data)[:props]
  end

  # Only one registration per teachercon per lead facilitator
  test 'Only one registration per lead facilitator per teachercon' do
    sign_in(@facilitator)
    registration_hash = build :pd_teachercon1819_registration_hash_common, :lead_facilitator_accepted
    create :pd_teachercon1819_registration, user: @facilitator, form_data: registration_hash.to_json, pd_application: nil

    get :lead_facilitator, params: {city: 'Phoenix'}
    assert_template('lead_facilitator_submitted')
  end
end
