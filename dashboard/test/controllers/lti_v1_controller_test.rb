require 'test_helper'
require 'json'
require 'jwt'
require 'policies/lti'
require "services/lti"
require "clients/lti_advantage_client"

class LtiV1ControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup_all do
    @integration = create :lti_integration
    @deployment = create :lti_deployment, lti_integration: @integration, deployment_id: SecureRandom.uuid
    # create an arbitrary key for testing JWTs
    @key = SecureRandom.alphanumeric 10
    # create arbitary state and nonce values
    @state = 'state'
    @nonce = 'nonce'
    @parsed_nrps_sections = {
      "1" =>
      {
        name: "Section 1",
        members: [
          {
            status: "Active",
            user_id: "0c00f8db-a039-45e1-8e2d-f1e17a047836",
            roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
            message: [
              {
                'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
                locale: "en",
                'https://purl.imsglobal.org/spec/lti/claim/custom': {
                  email: "student0@code.org",
                  course_id: "115",
                  full_name: "Test Zero",
                  given_name: "Test",
                  family_name: "Zero",
                  section_ids: "1,2,3",
                  display_name: "Test Zero",
                  section_names: "[\"Section 1\", \"Section 2\", \"Section 3\"]"
                }
              }
            ]
          },
          {
            status: "Active",
            user_id: "8741ee5e-7544-484d-a7a5-9fce2b29b960",
            roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
            message: [
              {
                'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
                locale: "en",
                'https://purl.imsglobal.org/spec/lti/claim/custom': {
                  email: "student1@code.org",
                  course_id: "115",
                  full_name: "Test One",
                  given_name: "Test",
                  family_name: "One",
                  section_ids: "1,2,3",
                  display_name: "Test One",
                  section_names: "[\"Section 1\", \"Section 2\", \"Section 3\"]"
                }
              }
            ]
          },
          {
            status: "Active",
            user_id: "cd50bfe6-cd55-4789-8d04-b4930fd8005d",
            roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
            message: [
              {
                'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
                locale: "en",
                'https://purl.imsglobal.org/spec/lti/claim/custom': {
                  email: "test2@code.org",
                  course_id: "115",
                  full_name: "Test Two",
                  given_name: "Test",
                  family_name: "Two",
                  section_ids: "1,2,3",
                  display_name: "Test Two",
                  section_names: "[\"Section 1\", \"Section 2\", \"Section 3\"]"
                }
              }
            ]
          }
        ]
      },
     "2" => {
       name: "Section 2",
       members: [
         {
           status: "Active",
           user_id: "0c00f8db-a039-45e1-8e2d-f1e17a047836",
           roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
           message: [
             {
               'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
               locale: "en",
               'https://purl.imsglobal.org/spec/lti/claim/custom': {
                 email: "student0@code.org",
                 course_id: "115",
                 full_name: "Test Zero",
                 given_name: "Test",
                 family_name: "Zero",
                 section_ids: "1,2,3",
                 display_name: "Test Zero",
                 section_names: "[\"Section 1\", \"Section 2\", \"Section 3\"]"
               }
             }
           ]
         },
         {
           status: "Active",
           user_id: "8741ee5e-7544-484d-a7a5-9fce2b29b960",
           roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
           message: [
             {
               'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
               locale: "en",
               'https://purl.imsglobal.org/spec/lti/claim/custom': {
                 email: "student1@code.org",
                 course_id: "115",
                 full_name: "Test One",
                 given_name: "Test",
                 family_name: "One",
                 section_ids: "1,2,3",
                 display_name: "Test One",
                 section_names: "[\"Section 1\", \"Section 2\", \"Section 3\"]"
               }
             }
           ]
         },
         {
           status: "Active",
           user_id: "cd50bfe6-cd55-4789-8d04-b4930fd8005d",
           roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
           message: [
             {
               'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
               locale: "en",
               'https://purl.imsglobal.org/spec/lti/claim/custom': {
                 email: "test2@code.org",
                 course_id: "115",
                 full_name: "Test Two",
                 given_name: "Test",
                 family_name: "Two",
                 section_ids: "1,2,3",
                 display_name: "Test Two",
                 section_names: "[\"Section 1\", \"Section 2\", \"Section 3\"]"
               }
             }
           ]
         }
       ]
     },
     "3" =>
     {
       name: "Section 3",
       members: [
         {
           status: "Active",
           user_id: "0c00f8db-a039-45e1-8e2d-f1e17a047836",
           roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
           message: [
             {
               'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
               locale: "en",
               'https://purl.imsglobal.org/spec/lti/claim/custom': {
                 email: "student0@code.org",
                 course_id: "115",
                 full_name: "Test Zero",
                 given_name: "Test",
                 family_name: "Zero",
                 section_ids: "1,2,3",
                 display_name: "Test Zero",
                 section_names: "[\"Section 1\", \"Section 2\", \"Section 3\"]"
               }
             }
           ]
         },
         {
           status: "Active",
           user_id: "8741ee5e-7544-484d-a7a5-9fce2b29b960",
           roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
           message: [
             {
               'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
               locale: "en",
               'https://purl.imsglobal.org/spec/lti/claim/custom': {
                 email: "student1@code.org",
                 course_id: "115",
                 full_name: "Test One",
                 given_name: "Test",
                 family_name: "One",
                 section_ids: "1,2,3",
                 display_name: "Test One",
                 section_names: "[\"Section 1\", \"Section 2\", \"Section 3\"]"
               }
             }
           ]
         },
         {
           status: "Active",
           user_id: "cd50bfe6-cd55-4789-8d04-b4930fd8005d",
           roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Learner"],
           message: [
             {
               'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
               locale: "en",
               'https://purl.imsglobal.org/spec/lti/claim/custom': {
                 email: "test2@code.org",
                 course_id: "115",
                 full_name: "Test Two",
                 given_name: "Test",
                 family_name: "Two",
                 section_ids: "1,2,3",
                 display_name: "Test Two",
                 section_names: "[\"Section 1\", \"Section 2\", \"Section 3\"]"
               }
             }
           ]
         }
       ]
     }
    }
  end

  setup do
    # stub cache reads for each test
    LtiV1Controller.any_instance.stubs(:read_cache).returns({state: @state, nonce: @nonce})
  end

  def create_jwt(payload)
    JWT.encode(payload, @key)
  end

  def create_jwt_and_stub(payload, raises_error: false)
    if raises_error
      LtiV1Controller.any_instance.stubs(:get_decoded_jwt).raises JWT::DecodeError
    else
      LtiV1Controller.any_instance.stubs(:get_decoded_jwt).returns payload
    end
    create_jwt(payload)
  end

  def get_valid_payload(aud_is_array = false)
    # an example redirect URI, any URI should work here.
    target_link_uri = CDO.studio_url('/', CDO.default_scheme)
    aud = if aud_is_array
            [@integration.client_id]
          else
            @integration.client_id
          end
    roles_key = Policies::Lti::LTI_ROLES_KEY
    custom_claims_key = Policies::Lti::LTI_CUSTOM_CLAIMS
    teacher_roles = Policies::Lti::TEACHER_ROLES
    nrps_url_key = Policies::Lti::LTI_NRPS_CLAIM
    resource_link_key = Policies::Lti::LTI_RESOURCE_LINK_CLAIM
    deployment_id_key = Policies::Lti::LTI_DEPLOYMENT_ID_CLAIM
    context_key = Policies::Lti::LTI_CONTEXT_CLAIM
    {
      aud: aud,
      azp: @integration.client_id,
      exp: 7.days.from_now.to_i,
      iat: 1.day.ago.to_i,
      iss: @integration.issuer,
      nonce: @nonce,
      'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': target_link_uri,
      'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiResourceLinkRequest',
      custom_claims_key => {
        display_name: 'hansolo',
        full_name: 'Han Solo',
        given_name: 'Han',
        family_name: 'Solo',
      },
      roles_key => teacher_roles,
      nrps_url_key => {
        context_memberships_url: 'https://example.com/nrps',
      },
      resource_link_key => {
        id: SecureRandom.uuid,
      },
      deployment_id_key => @deployment.deployment_id,
      context_key => {
        id: SecureRandom.uuid,
      },
    }
  end

  def create_valid_jwt(aud_is_array)
    payload = get_valid_payload(aud_is_array)
    create_jwt_and_stub(payload)
  end

  def create_valid_jwt_raise_error
    payload = get_valid_payload(false)
    create_jwt_and_stub(payload, raises_error: true)
  end

  test 'login - given no params, return unauthorized' do
    get '/lti/v1/login', params: {}
    assert_response :unauthorized
  end

  test 'login - given a client_id that doesn not exist, return unauthorized' do
    get '/lti/v1/login', params: {client_id: '', iss: @integration.issuer}
    assert_response :unauthorized
  end

  test 'login - given a platform_id that does not exist, return unauthorized' do
    get '/lti/v1/login/wrong-id', params: {}
    assert_response :unauthorized
  end

  test 'login - given a valid client_id via GET, return redirect' do
    get '/lti/v1/login', params: {client_id: @integration.client_id, iss: @integration.issuer}
    assert_response :redirect
  end

  test 'login - given a valid client_id via POST, return redirect' do
    post '/lti/v1/login', params: {client_id: @integration.client_id, iss: @integration.issuer}
    assert_response :redirect
  end

  test 'login - given a valid platform_id, return redirect' do
    get "/lti/v1/login/#{@integration.platform_id}", params: {}
    assert_response :redirect
  end

  test 'login - given a valid client_id, write_cache should be called' do
    LtiV1Controller.any_instance.expects(:write_cache)
    get '/lti/v1/login', params: {client_id: @integration.client_id, iss: @integration.issuer}
  end

  test 'login - given valid parameters, redirect URL should have valid auth request params' do
    login_hint = 'hint'
    get '/lti/v1/login', params: {client_id: @integration.client_id, iss: @integration.issuer, login_hint: login_hint}
    parsed_url = Rack::Utils.parse_query(URI(@response.redirect_url).query).symbolize_keys
    assert_equal parsed_url[:scope], 'openid'
    assert_equal parsed_url[:response_type], 'id_token'
    assert_equal parsed_url[:client_id], @integration.client_id
    assert_equal parsed_url[:response_mode], 'form_post'
    assert_equal parsed_url[:prompt], 'none'
    assert_equal parsed_url[:login_hint], login_hint
    refute_nil parsed_url[:state]
    refute_nil parsed_url[:nonce]
  end

  test 'auth - given no params, return unauthorized' do
    post '/lti/v1/authenticate'
    assert_response :unauthorized
  end

  test 'auth - given no client_id (aud) in jwt return unauthorized' do
    payload = get_valid_payload
    payload[:aud] = nil
    jwt = create_jwt(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - given no issuer id in jwt return unauthorized' do
    payload = get_valid_payload
    payload[:iss] = nil
    jwt = create_jwt(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - given wrong client id in jwt return unauthorized' do
    payload = get_valid_payload
    payload[:aud] = ''
    jwt = create_jwt(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - audience does not match client_id with azp present - unauthorized' do
    payload = get_valid_payload
    payload[:azp] = ''
    jwt = create_jwt_and_stub(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - expiration time past return unauthorized' do
    payload = get_valid_payload
    payload[:exp] = 3.days.ago.to_i
    jwt = create_jwt_and_stub(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - error raised for issued at time in future' do
    payload = get_valid_payload
    payload[:iat] = 3.days.from_now.to_i
    jwt = create_jwt(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - LTI Resource Type wrong' do
    payload = get_valid_payload
    payload[:'https://purl.imsglobal.org/spec/lti/claim/message_type'] = 'file'
    LtiV1Controller.any_instance.stubs(:get_decoded_jwt).returns payload
    jwt = create_jwt(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :not_acceptable
  end

  test 'auth - error raised in decoding jwt' do
    jwt = create_valid_jwt_raise_error
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - given a valid jwt with the audience as an array, redirect to target_link_url' do
    aud_is_array = true
    jwt = create_valid_jwt(aud_is_array)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :redirect
  end

  test 'auth - given a valid jwt, redirect to target_link_url' do
    aud_is_array = false
    jwt = create_valid_jwt(aud_is_array)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :redirect
    # could confirm more things here
  end

  test 'sync - should redirect students to homepage without syncing' do
    user = create :student
    sign_in user
    get '/lti/v1/sync_course', params: {lti_integration_id: 'foo', deployment_id: 'bar', context_id: 'baz', rlid: 'qux', nrps_url: 'quux'}
    assert_response :redirect
    assert_equal home_path, '/' + @response.redirect_url.split('/').last
  end

  test 'sync - should sync and show the confirmation page' do
    had_changes = true
    user = create :teacher
    sign_in user
    lti_integration = create :lti_integration
    lti_course = create :lti_course, lti_integration: lti_integration, context_id: SecureRandom.uuid, resource_link_id: SecureRandom.uuid, nrps_url: 'https://example.com/nrps'
    LtiAdvantageClient.any_instance.expects(:get_context_membership).with(lti_course.nrps_url, lti_course.resource_link_id)
    Services::Lti.expects(:parse_nrps_response).returns(@parsed_nrps_sections)
    Services::Lti.expects(:sync_course_roster).returns(had_changes)

    get '/lti/v1/sync_course', params: {lti_integration_id: lti_integration.id, deployment_id: 'foo', context_id: lti_course.context_id, rlid: lti_course.resource_link_id, nrps_url: lti_course.nrps_url}
    assert_response :ok
  end

  test 'sync - should not sync given no changes' do
    had_changes = false
    user = create :teacher
    sign_in user
    lti_integration = create :lti_integration
    lti_course = create :lti_course, lti_integration: lti_integration, context_id: SecureRandom.uuid, resource_link_id: SecureRandom.uuid, nrps_url: 'https://example.com/nrps'
    LtiAdvantageClient.any_instance.expects(:get_context_membership).with(lti_course.nrps_url, lti_course.resource_link_id)
    Services::Lti.expects(:parse_nrps_response).returns(@parsed_nrps_sections)
    Services::Lti.expects(:sync_course_roster).returns(had_changes)

    get '/lti/v1/sync_course', params: {lti_integration_id: lti_integration.id, deployment_id: 'foo', context_id: lti_course.context_id, rlid: lti_course.resource_link_id, nrps_url: lti_course.nrps_url}
    assert_response :redirect
  end

  test 'sync - should be able to sync from a section code' do
    user = create :teacher
    sign_in user
    lti_integration = create :lti_integration
    lti_course = create :lti_course, lti_integration: lti_integration, context_id: SecureRandom.uuid, resource_link_id: SecureRandom.uuid, nrps_url: 'https://example.com/nrps'
    lti_section = create :lti_section, lti_course: lti_course
    LtiAdvantageClient.any_instance.expects(:get_context_membership).with(lti_course.nrps_url, lti_course.resource_link_id)
    Services::Lti.expects(:parse_nrps_response).returns(@parsed_nrps_sections)
    Services::Lti.expects(:sync_course_roster).returns(true)

    get '/lti/v1/sync_course', params: {section_code: lti_section.section.code}
    assert_response :ok
  end

  test 'transaction prevents partial sync from creating a partially-synced state' do
    user = create :teacher
    sign_in user
    lti_integration = create :lti_integration
    lti_course = create :lti_course, lti_integration: lti_integration, context_id: SecureRandom.uuid, resource_link_id: SecureRandom.uuid, nrps_url: 'https://example.com/nrps'

    LtiAdvantageClient.any_instance.expects(:get_context_membership).with(lti_course.nrps_url, lti_course.resource_link_id)
    Services::Lti.expects(:parse_nrps_response).returns(@parsed_nrps_sections)

    # Set up a situation where a sync has partially progressed, including saving some objects, but then
    # encounters an error. Raising an exception during the section sync should cause the transaction to rollback after
    # creating the first Section and LtiSection in the course sync method.
    Services::Lti.expects(:sync_section_roster).raises(Exception, 'sync error')

    get '/lti/v1/sync_course', params: {lti_integration_id: lti_integration.id, deployment_id: 'foo', context_id: lti_course.context_id, rlid: lti_course.resource_link_id, nrps_url: lti_course.nrps_url}
    assert_empty lti_course.lti_sections
    assert_response :internal_server_error
  end

  test 'integration - given valid inputs, creates a new integration if one does not exist' do
    client_id = "1234canvas"
    lms = "canvas_cloud"

    post '/lti/v1/create_integration', params: {client_id: client_id, lms: lms}
    assert_response :ok

    client_id = "5678schoology"
    lms = "schoology"

    post '/lti/v1/create_integration', params: {client_id: client_id, lms: lms}
    assert_response :ok
  end

  test 'integration - given missing inputs, does not create a new integration' do
    client_id = "1234canvas"
    lms = "canvas_cloud"

    post '/lti/v1/create_integration', params: {lms: lms}
    assert_response :bad_request

    post '/lti/v1/create_integration', params: {client_id: client_id, lms: ''}
    assert_response :bad_request
  end

  test 'integration - if existing integration, does not create a new one' do
    client_id = "1234canvas"
    lms = "canvas_cloud"

    post '/lti/v1/create_integration', params: {client_id: client_id, lms: lms}
    assert_response :ok
    post '/lti/v1/create_integration', params: {client_id: client_id, lms: lms}
    assert_response :conflict
  end
end
