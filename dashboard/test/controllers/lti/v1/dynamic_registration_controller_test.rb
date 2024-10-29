require 'policies/lti'
require 'test_helper'
require "clients/cache_client"
require 'webmock/minitest'
WebMock.disable_net_connect!(allow_localhost: true)

class Lti::V1::DynamicRegistrationControllerTest < ActionController::TestCase
  test 'dynamic_registration - renders dynamic registration page if valid params are present' do
    openid_configuration = 'https://example.com'
    registration_token = SecureRandom.uuid
    stub_request(:get, openid_configuration).to_return(
      body: {
        registration_endpoint: 'https://example.registration.com',
        issuer: 'https://example.issuer.com',
        Policies::Lti::CANVAS_ACCOUNT_NAME => 'example',
      }.to_json,
      status: 200,
      headers: {'Content-Type' => 'application/json'},
    )

    get :new_registration, params: {openid_configuration: openid_configuration, registration_token: registration_token}
    assert_template 'lti/v1/dynamic_registration'
    get :new_registration
    assert_response :internal_server_error
  end

  test 'dynamic_registration - creates LTI integration with valid values' do
    registration_id = SecureRandom.uuid
    client_id = SecureRandom.alphanumeric(10)
    name = 'example'
    email = 'example@test.com'
    registration_data = {
      registration_token: SecureRandom.uuid,
      registration_endpoint: 'https://example.com',
      issuer: Policies::Lti::LMS_PLATFORMS[:canvas_cloud][:issuer],
      lms_account_name: name,
    }
    CacheClient.any_instance.stubs(:read).with(registration_id).returns(registration_data)
    response = {client_id: client_id}
    LtiDynamicRegistrationClient.any_instance.stubs(:make_registration_request).returns(response)

    Metrics::Events.expects(:log_event_with_session).with(
      has_entries(
        session: session,
        event_name: 'lti_dynamic_registration_completed',
        metadata: {
          lms_name: Policies::Lti::LMS_PLATFORMS[:canvas_cloud][:name],
        },
      )
    )

    post :create_registration, params: {email: email, registration_id: registration_id}
    assert_response :created
    integration = Queries::Lti.get_lti_integration(registration_data[:issuer], client_id)
    assert integration
    assert_equal name, integration.name
    assert_equal client_id, integration.client_id
    assert_equal registration_data[:issuer], integration.issuer
    assert_equal email, integration.admin_email
  end

  test 'dynamic_registration - should error with invalid parameters' do
    # missing email
    post :create_registration, params: {registration_id: SecureRandom.uuid}
    assert_response :bad_request
    # missing registration_id
    CacheClient.any_instance.stubs(:read).with(nil).returns(nil)

    post :create_registration, params: {email: 'example@test.com'}
    assert_response :unauthorized
  end

  test 'dynamic_registration - should error with unsupported issuer' do
    email = 'example@test.com'
    registration_id = SecureRandom.uuid
    registration_data = {
      issuer: 'fake'
    }
    CacheClient.any_instance.stubs(:read).with(registration_id).returns(registration_data)

    post :create_registration, params: {email: email, registration_id: registration_id}
    assert_response :unprocessable_entity
  end

  test 'dynamic_registration - should error if unsuccessful request to registration_endpoint' do
    registration_id = SecureRandom.uuid
    name = 'example'
    email = 'example@test.com'
    registration_data = {
      registration_token: SecureRandom.uuid,
      registration_endpoint: 'https://example.com',
      issuer: Policies::Lti::LMS_PLATFORMS[:canvas_cloud][:issuer],
      lms_account_name: name,
    }
    CacheClient.any_instance.stubs(:read).with(registration_id).returns(registration_data)
    LtiDynamicRegistrationClient.any_instance.stubs(:make_registration_request).raises RuntimeError

    post :create_registration, params: {email: email, registration_id: registration_id}
    assert_response :internal_server_error
  end
end
