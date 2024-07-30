require 'test_helper'
require 'json'
require 'jwt'
require 'policies/lti'
require "services/lti"
require "clients/lti_advantage_client"
require 'clients/lti_dynamic_registration_client'

class LtiV1ControllerTest < ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers

  setup_all do
    @integration = create :lti_integration
    @deployment_id = SecureRandom.uuid
    @key = SecureRandom.alphanumeric 10
    # create arbitary state and nonce values
    @state = 'state'
    @nonce = 'nonce'
    @parsed_nrps_sections = {
      "1" =>
      {
        name: "Section 1",
        short_name: "Section 1",
        members: [
          {
            status: "Active",
            user_id: "f2a16942-ed81-4c98-96dc-5cac16e354ec",
            roles: ["http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"],
            message: [
              {
                'https://purl.imsglobal.org/spec/lti/claim/message_type': "LtiResourceLinkRequest",
                locale: "en",
                'https://purl.imsglobal.org/spec/lti/claim/custom': {
                  email: "teacher0@code.org",
                  course_id: "115",
                  full_name: "Teacher",
                  given_name: "Test",
                  family_name: "Zero",
                  section_ids: "1,2,3",
                  display_name: "Test Teacher Zero",
                  section_names: "[\"Section 1\", \"Section 2\", \"Section 3\"]"
                }
              }
            ]
          },
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
       short_name: "Section 1",
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
       short_name: "Section 1",
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

    @sync_course_result_with_changes = {
      all: {
        '1' => {name: 'Section 1', short_name: 'Section 1', size: 3, instructors: [{name: 'Teacher', id: 0, isOwner: true}],},
        '2' => {name: 'Section 2', short_name: 'Section 2', size: 3, instructors: [{name: 'Teacher', id: 0, isOwner: true}],},
        '3' => {name: 'Section 3', short_name: 'Section 3', size: 3, instructors: [{name: 'Teacher', id: 0, isOwner: true}],},
      },
      changed: {
        '1' => {name: 'Section 1', short_name: 'Section 1', size: 3, instructors: [{name: 'Teacher', id: 0, isOwner: true}],},
        '2' => {name: 'Section 2', short_name: 'Section 2', size: 3, instructors: [{name: 'Teacher', id: 0, isOwner: true}],},
        '3' => {name: 'Section 3', short_name: 'Section 3', size: 3, instructors: [{name: 'Teacher', id: 0, isOwner: true}],},
      },
    }

    @sync_course_result_no_changes = {
      all: {
        '1' => {name: 'Section 1', short_name: 'Section 1', size: 3, instructors: [{name: 'Teacher', id: 0, isOwner: true}],},
        '2' => {name: 'Section 2', short_name: 'Section 2', size: 3, instructors: [{name: 'Teacher', id: 0, isOwner: true}],},
        '3' => {name: 'Section 3', short_name: 'Section 3', size: 3, instructors: [{name: 'Teacher', id: 0, isOwner: true}],},
      },
      changed: {},
    }
  end

  setup do
    # stub cache reads for each test
    LtiV1Controller.any_instance.stubs(:read_cache).with(@state).returns({state: @state, nonce: @nonce})
    LtiV1Controller.any_instance.stubs(:read_cache).with("#{@integration.issuer}/#{@integration.client_id}").returns(@integration)
    Honeybadger.stubs(:notify)
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
    teacher_roles = Policies::Lti::STAFF_ROLES
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
      sub: 'LTI-AUTH',
      nonce: @nonce,
      'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': target_link_uri,
      'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiResourceLinkRequest',
      custom_claims_key => {
        display_name: 'hansolo',
        full_name: 'Han Solo',
        given_name: 'Han',
        family_name: 'Solo',
        email: 'test@code.org'
      },
      roles_key => teacher_roles,
      nrps_url_key => {
        context_memberships_url: 'https://example.com/nrps',
      },
      resource_link_key => {
        id: SecureRandom.uuid,
      },
      deployment_id_key => @deployment_id,
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
    assert_match 'Unsupported LTI message type', @response.body
    assert_match 'Sorry! It looks like you are trying to launch the Code.org Integration via a file.', @response.body
    assert_match 'Please try launching Code.org again from a <a href="https://github.com/code-dot-org/code-dot-org/blob/staging/docs/lti-integration.md#option-2-manual-entry">supported method</a>.', @response.body
  end

  test 'auth - error raised in decoding jwt' do
    jwt = create_valid_jwt_raise_error
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_response :unauthorized
  end

  test 'auth - if cached value is nil during the state/nonce check, return unauthorized' do
    aud_is_array = false
    jwt = create_valid_jwt(aud_is_array)
    LtiV1Controller.any_instance.stubs(:read_cache).with(@state)
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

  test 'auth - given a deployment_id not in our system yet, create LtiDeployment' do
    payload = get_valid_payload
    jwt = create_jwt_and_stub(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    deployment = LtiDeployment.find_by(deployment_id: @deployment_id)
    assert deployment
    assert_equal deployment, @integration.lti_deployments.first
  end

  test 'auth - given an existing deployment_id in our system, do not create a new LtiDeployment' do
    payload = get_valid_payload
    jwt = create_jwt_and_stub(payload)
    deployment = LtiDeployment.create(deployment_id: @deployment_id, lti_integration_id: @integration.id)
    assert deployment
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_equal deployment, @integration.lti_deployments.first
    assert_equal @integration.lti_deployments.count, 1
  end

  test 'auth - should render the upgrade account page if the LTI has the same user as an instructor' do
    payload = get_valid_payload
    jwt = create_jwt_and_stub(payload)

    user = create :student
    user.update(lms_landing_opted_out: true)
    ao = AuthenticationOption.new(
      user: user,
      email: Services::Lti.get_claim(payload, :email),
      credential_type: AuthenticationOption::LTI_V1,
      authentication_id: Services::Lti::AuthIdGenerator.new(payload).call
    )
    ao.save!

    deployment = LtiDeployment.create(deployment_id: @deployment_id, lti_integration_id: @integration.id)
    assert deployment
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}

    assert_response :ok
    assert_template 'lti/v1/upgrade_account'
  end

  test 'auth - should NOT upgrade if student and LTI informs that this is a learner' do
    payload = {**get_valid_payload, Policies::Lti::LTI_ROLES_KEY => [Policies::Lti::CONTEXT_LEARNER_ROLE]}
    jwt = create_jwt_and_stub(payload)

    user = create :student
    user.update(lms_landing_opted_out: true)
    ao = AuthenticationOption.new(
      user: user,
      email: Services::Lti.get_claim(payload, :email),
      credential_type: AuthenticationOption::LTI_V1,
      authentication_id: Services::Lti::AuthIdGenerator.new(payload).call
    )
    ao.save!

    deployment = LtiDeployment.create(deployment_id: @deployment_id, lti_integration_id: @integration.id)
    assert deployment
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}

    assert_response :redirect
  end

  test 'auth - should redirect to iframe route if LMS caller is Schoology AND new_tab=true param is missing' do
    issuer = Policies::Lti::LMS_PLATFORMS[:schoology][:issuer]
    integration = create :lti_integration, issuer: issuer
    # Override read_cache stub with this integration
    LtiV1Controller.any_instance.stubs(:read_cache).with("#{integration.issuer}/#{integration.client_id}").returns(integration)
    payload = {**get_valid_payload, iss: issuer, aud: integration.client_id}
    jwt = create_jwt_and_stub(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}
    assert_template 'lti/v1/iframe'
  end

  test 'auth - should NOT redirect to iframe route if LMS caller is Schoology AND new_tab=true param is present' do
    issuer = Policies::Lti::LMS_PLATFORMS[:schoology][:issuer]
    integration = create :lti_integration, issuer: issuer
    # Override read_cache stub with this integration
    LtiV1Controller.any_instance.stubs(:read_cache).with("#{integration.issuer}/#{integration.client_id}").returns(integration)
    payload = {**get_valid_payload, iss: issuer, aud: integration.client_id, azp: integration.client_id}
    jwt = create_jwt_and_stub(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state, new_tab: true}
    assert_response :redirect
    assert_redirected_to '/users/sign_up'
  end

  test 'auth - should render the landing page and store session state' do
    DCDO.stubs(:get)
    Cpa.stubs(:cpa_experience).with(any_parameters).returns(false)
    SignUpTracking.stubs(:begin_sign_up_tracking).returns(false)
    DCDO.stubs(:get).with(I18nStringUrlTracker::I18N_STRING_TRACKING_DCDO_KEY, false).returns(false)
    DCDO.stubs(:get).with('student-email-post-enabled', false).returns(true)
    payload = {**get_valid_payload, Policies::Lti::LTI_ROLES_KEY => [Policies::Lti::CONTEXT_LEARNER_ROLE]}
    jwt = create_jwt_and_stub(payload)

    deployment = LtiDeployment.create(deployment_id: @deployment_id, lti_integration_id: @integration.id)
    assert deployment
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}

    expected = {
      lti_provider_name: "platform_name",
      new_cta_type: "new",
      user_type: "student",
    }

    assert_equal expected, session[:lms_landing]
    assert_template 'lti/v1/account_linking/landing'
  end

  test 'auth - should create teacher account if user is both teacher and student' do
    DCDO.stubs(:get)
    DCDO.stubs(:get).with('lti_account_linking_enabled', false).returns(true)
    payload = {**get_valid_payload, Policies::Lti::LTI_ROLES_KEY => [Policies::Lti::CONTEXT_LEARNER_ROLE, Policies::Lti::TEACHER_ROLES.first]}
    jwt = create_jwt_and_stub(payload)
    post '/lti/v1/authenticate', params: {id_token: jwt, state: @state}

    expected = {
      lti_provider_name: "platform_name",
      new_cta_type: "new",
      user_type: "teacher",
    }

    assert_equal expected, session[:lms_landing]
    assert_template 'lti/v1/account_linking/landing'
  end

  test 'sync - should redirect students to homepage without syncing' do
    user = create :student
    sign_in user
    get '/lti/v1/sync_course', params: {lti_integration_id: 'foo', deployment_id: 'bar', context_id: 'baz', rlid: 'qux', nrps_url: 'quux'}
    assert_response :redirect
    assert_equal home_path, '/' + @response.redirect_url.split('/').last
  end

  test 'sync - should not sync when section code is blank and required param missing' do
    user = create :teacher, :with_lti_auth
    sign_in user
    get '/lti/v1/sync_course', params: {lti_integration_id: nil, deployment_id: nil, context_id: nil, rlid: nil, nrps_url: nil}
    assert_response :bad_request
  end

  test 'sync - should not sync when launching from wrong context' do
    user = create :teacher, :with_lti_auth
    sign_in user
    LtiV1Controller.any_instance.expects(:render_sync_course_error).with('Attempting to sync a course or section from the wrong place.', :bad_request, 'wrong_context')
    get '/lti/v1/sync_course', params: {lti_integration_id: 'foo', deployment_id: 'bar', context_id: nil, rlid: 'qux', nrps_url: nil}
  end

  test 'sync - should not sync and render sync course error when missing a param' do
    user = create :teacher, :with_lti_auth
    sign_in user
    LtiV1Controller.any_instance.expects(:render_sync_course_error).with("Missing lti_integration_id.", :bad_request, 'missing_param')
    get '/lti/v1/sync_course', params: {lti_integration_id: nil, deployment_id: 'qux', context_id: 'foo', rlid: 'quux', nrps_url: 'bar'}
  end

  test 'sync - should sync and show the confirmation page' do
    user = create :teacher, :with_lti_auth
    sign_in user
    lti_integration = create :lti_integration
    lti_course = create :lti_course, lti_integration: lti_integration, context_id: SecureRandom.uuid, resource_link_id: SecureRandom.uuid, nrps_url: 'https://example.com/nrps'
    LtiAdvantageClient.any_instance.expects(:get_context_membership).with(lti_course.nrps_url, lti_course.resource_link_id).returns({})
    Services::Lti.expects(:parse_nrps_response).returns(@parsed_nrps_sections)
    Services::Lti.expects(:sync_course_roster).returns(@sync_course_result_with_changes)

    get '/lti/v1/sync_course', params: {lti_integration_id: lti_integration.id, deployment_id: 'foo', context_id: lti_course.context_id, rlid: lti_course.resource_link_id, nrps_url: lti_course.nrps_url}
    assert_response :ok
  end

  test 'sync - should update the LtiCourse resource link id if the params rlid has changed' do
    user = create :teacher, :with_lti_auth
    sign_in user
    lti_integration = create :lti_integration
    lti_course = create :lti_course, lti_integration: lti_integration, context_id: SecureRandom.uuid, resource_link_id: SecureRandom.uuid, nrps_url: 'https://example.com/nrps'
    new_resource_id = SecureRandom.uuid
    LtiAdvantageClient.any_instance.expects(:get_context_membership).with(lti_course.nrps_url, new_resource_id).returns({})
    Services::Lti.expects(:parse_nrps_response).returns(@parsed_nrps_sections)
    Services::Lti.expects(:sync_course_roster).returns(@sync_course_result_with_changes)

    get '/lti/v1/sync_course', params: {lti_integration_id: lti_integration.id, deployment_id: 'foo', context_id: lti_course.context_id, rlid: new_resource_id, nrps_url: lti_course.nrps_url}

    lti_course.reload
    assert_response :ok
    assert_equal new_resource_id, lti_course.resource_link_id
  end

  test 'sync_course as json - syncs and returns course sections data' do
    lti_course_context_id = SecureRandom.uuid
    lti_course_resource_link_id = SecureRandom.uuid
    lti_course_nrps_url = 'https://example.com/nrps'

    user = create :teacher, :with_lti_auth
    lti_integration = create :lti_integration
    create(
      :lti_course,
      lti_integration: lti_integration,
      context_id: lti_course_context_id,
      resource_link_id: lti_course_resource_link_id,
      nrps_url: lti_course_nrps_url
    )

    LtiAdvantageClient.any_instance.expects(:get_context_membership).with(lti_course_nrps_url, lti_course_resource_link_id).returns({})
    Services::Lti.expects(:parse_nrps_response).returns(@parsed_nrps_sections)
    Services::Lti.expects(:sync_course_roster).returns(@sync_course_result_no_changes)

    sign_in user

    assert_no_difference 'LtiCourse.count' do
      get '/lti/v1/sync_course', params: {
        lti_integration_id: lti_integration.id,
        deployment_id: 'foo',
        context_id: lti_course_context_id,
        rlid: lti_course_resource_link_id,
        nrps_url: lti_course_nrps_url
      }, as: :json
    end

    assert_response :ok
    assert_equal @sync_course_result_no_changes.to_json, response.body
  end

  test 'sync_course as json - does not sync and returns NRPS response errors when Canvas LTI key is missing required fields' do
    expected_nrps_response_error_1 = 'error1'
    expected_nrps_response_error_2 = 'error2'

    lti_course_context_id = SecureRandom.uuid
    lti_course_resource_link_id = SecureRandom.uuid
    lti_course_nrps_url = 'https://example.com/nrps'

    user = create :teacher, :with_lti_auth
    lti_integration = create :lti_integration

    LtiAdvantageClient.
      any_instance.
      expects(:get_context_membership).
      with(lti_course_nrps_url, lti_course_resource_link_id).
      returns(@parsed_nrps_sections)
    Policies::Lti.expects(:issuer_accepts_resource_link?).
      with(lti_integration.issuer).
      returns(true)
    Services::Lti::NRPSResponseValidator.
      expects(:call).
      with(@parsed_nrps_sections).
      returns([expected_nrps_response_error_1, expected_nrps_response_error_2])

    Services::Lti.expects(:parse_nrps_response).never
    Services::Lti.expects(:sync_course_roster).never

    sign_in user

    assert_no_difference 'LtiCourse.count' do
      get '/lti/v1/sync_course', params: {
        lti_integration_id: lti_integration.id,
        deployment_id: 'foo',
        context_id: lti_course_context_id,
        rlid: lti_course_resource_link_id,
        nrps_url: lti_course_nrps_url
      }, as: :json
    end

    expected_response = {
      'error' => 'invalid_configs',
      'message' => "#{expected_nrps_response_error_1}\n#{expected_nrps_response_error_2}"
    }

    assert_response :unprocessable_entity
    assert_equal expected_response, JSON.parse(response.body)
  end

  test 'sync_course as json - does not validate response of the non rlid NRPS request' do
    lti_course_context_id = SecureRandom.uuid
    lti_course_resource_link_id = SecureRandom.uuid
    lti_course_nrps_url = 'https://example.com/nrps'

    user = create :teacher, :with_lti_auth
    lti_integration = create :lti_integration

    LtiAdvantageClient.any_instance.expects(:get_context_membership).with(lti_course_nrps_url, lti_course_resource_link_id).returns({})
    Policies::Lti.expects(:issuer_accepts_resource_link?).with(lti_integration.issuer).returns(false)
    Services::Lti::NRPSResponseValidator.expects(:call).never
    Services::Lti.expects(:parse_nrps_response).returns(@parsed_nrps_sections)
    Services::Lti.expects(:sync_course_roster).returns(@sync_course_result_with_changes)

    sign_in user

    assert_no_difference 'LtiCourse.count' do
      get '/lti/v1/sync_course', params: {
        lti_integration_id: lti_integration.id,
        deployment_id: 'foo',
        context_id: lti_course_context_id,
        rlid: lti_course_resource_link_id,
        nrps_url: lti_course_nrps_url
      }, as: :json
    end

    assert_response :ok
  end

  test 'sync - should not sync given no changes' do
    user = create :teacher, :with_lti_auth
    sign_in user
    lti_integration = create :lti_integration
    lti_course = create :lti_course, lti_integration: lti_integration, context_id: SecureRandom.uuid, resource_link_id: SecureRandom.uuid, nrps_url: 'https://example.com/nrps'
    LtiAdvantageClient.any_instance.expects(:get_context_membership).with(lti_course.nrps_url, lti_course.resource_link_id).returns({})
    Services::Lti.expects(:parse_nrps_response).returns(@parsed_nrps_sections)
    Services::Lti.expects(:sync_course_roster).returns(@sync_course_result_no_changes)

    get '/lti/v1/sync_course', params: {lti_integration_id: lti_integration.id, deployment_id: 'foo', context_id: lti_course.context_id, rlid: lti_course.resource_link_id, nrps_url: lti_course.nrps_url}
    assert_response :redirect
  end

  test 'sync - should be able to sync from a section code' do
    user = create :teacher, :with_lti_auth
    sign_in user
    lti_integration = create :lti_integration
    lti_course = create :lti_course, lti_integration: lti_integration, context_id: SecureRandom.uuid, resource_link_id: SecureRandom.uuid, nrps_url: 'https://example.com/nrps'
    lti_section = create :lti_section, lti_course: lti_course
    LtiAdvantageClient.any_instance.expects(:get_context_membership).with(lti_course.nrps_url, lti_course.resource_link_id).returns({})
    Services::Lti.expects(:parse_nrps_response).returns(@parsed_nrps_sections)
    Services::Lti.expects(:sync_course_roster).returns(@sync_course_result_with_changes)

    get '/lti/v1/sync_course', params: {section_code: lti_section.section.code}
    assert_response :ok
  end

  test 'transaction prevents partial sync from creating a partially-synced state' do
    user = create :teacher, :with_lti_auth
    sign_in user
    lti_integration = create :lti_integration
    lti_course = create :lti_course, lti_integration: lti_integration, context_id: SecureRandom.uuid, resource_link_id: SecureRandom.uuid, nrps_url: 'https://example.com/nrps'
    create :lti_user_identity, lti_integration: lti_integration, user: user, subject: 'f2a16942-ed81-4c98-96dc-5cac16e354ec'

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
    name = "Fake School"
    client_id = "1234canvas"
    lms = "canvas_cloud"
    email = "fake@email.com"

    post '/lti/v1/integrations', params: {name: name, client_id: client_id, lms: lms, email: email}
    assert_response :ok

    client_id = "5678schoology"
    lms = "schoology"

    post '/lti/v1/integrations', params: {name: name, client_id: client_id, lms: lms, email: email}
    assert_response :ok
  end

  test 'integration - given missing inputs, does not create a new integration' do
    name = "Fake School"
    client_id = "1234canvas"
    lms = "canvas_cloud"
    email = "fake@email.com"

    # missing client_id
    post '/lti/v1/integrations', params: {name: name, lms: lms, email: email}
    assert_equal I18n.t('lti.error.missing_params'), flash[:alert]

    # missing lms
    post '/lti/v1/integrations', params: {name: name, client_id: client_id, lms: '', email: email}
    assert_equal I18n.t('lti.error.missing_params'), flash[:alert]

    # missing email
    post '/lti/v1/integrations', params: {name: name, client_id: client_id}
    assert_equal I18n.t('lti.error.missing_params'), flash[:alert]

    # unsupported lms type
    post '/lti/v1/integrations', params: {name: name, client_id: client_id, lms: 'unsupported', email: email}
    assert_equal I18n.t('lti.error.unsupported_lms_type'), flash[:alert]

    # missing name
    post '/lti/v1/integrations', params: {client_id: client_id, lms: lms, email: email}
    assert_equal I18n.t('lti.error.missing_params'), flash[:alert]
  end

  test 'integration - if existing integration, does not create a new one' do
    name = "Fake School"
    client_id = "1234canvas"
    lms = "canvas_cloud"
    email = "fake@email.com"

    post '/lti/v1/integrations', params: {name: name, client_id: client_id, lms: lms, email: email}
    assert_template 'lti/v1/integration_status'
    post '/lti/v1/integrations', params: {name: name, client_id: client_id, lms: lms, email: email}
    assert_template 'lti/v1/integration_status'
  end

  test 'attempting to sync a section with no LTI course should return a 400' do
    user = create :teacher, :with_lti_auth
    sign_in user

    get '/lti/v1/sync_course', params: {section_code: 'bad-section-code'}
    assert_response :bad_request
  end

  test 'attempting to sync a section with a missing LTI integration should return a 400' do
    user = create :teacher, :with_lti_auth
    sign_in user
    bad_params = {lti_integration_id: 'foo', deployment_id: 'bar', context_id: 'baz', rlid: 'qux', nrps_url: 'quux'}
    get '/lti/v1/sync_course', params: bad_params
    assert_response :bad_request
  end

  test 'upgrade_account - throws unauthorized if user is not logged in' do
    post '/lti/v1/upgrade_account'

    assert_response :unauthorized
  end

  test 'upgrade_account - throws bad request if missing email' do
    user = create :student
    sign_in user

    post '/lti/v1/upgrade_account'
    assert_response :bad_request
  end

  test 'upgrade_account - upgrades current user to teacher' do
    user = create :student, :with_lti_auth
    sign_in user
    post '/lti/v1/upgrade_account', params: {email: 'test-teacher@code.org'}

    assert_response :ok
    user.reload
    assert_equal User::TYPE_TEACHER, user.user_type
    assert_equal true, user.lti_roster_sync_enabled
  end

  test 'should not sync if the user has roster sync disabled' do
    user = create :teacher, :with_lti_auth
    user.lti_roster_sync_enabled = false
    user.save!
    sign_in user
    lti_integration = create :lti_integration
    lti_course = create :lti_course, lti_integration: lti_integration, context_id: SecureRandom.uuid, resource_link_id: SecureRandom.uuid, nrps_url: 'https://example.com/nrps'
    LtiAdvantageClient.any_instance.expects(:get_context_membership).never
    Services::Lti.expects(:parse_nrps_response).never
    Services::Lti.expects(:sync_course_roster).never

    get '/lti/v1/sync_course', params: {lti_integration_id: lti_integration.id, deployment_id: 'foo', context_id: lti_course.context_id, rlid: lti_course.resource_link_id, nrps_url: lti_course.nrps_url}
    assert_response :redirect
  end
end
