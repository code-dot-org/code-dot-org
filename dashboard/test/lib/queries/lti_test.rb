require 'test_helper'

class Services::LtiTest < ActiveSupport::TestCase
  test 'get_user returns an existing user' do
    user = create :user
    id_token = {
      sub: 'some-sub',
      aud: 'some-aud',
      iss: 'http://some-iss.com',
    }
    user.authentication_options.create(
      authentication_id: Services::Lti::AuthIdGenerator.new(id_token).call,
      credential_type: AuthenticationOption::LTI_V1,
    )

    assert_equal user, Queries::Lti.get_user(id_token)
  end

  test 'finds a code.org user given LTI integration creds and an NRPS member response' do
    user = create :user
    lms_user_id = SecureRandom.uuid
    lms_issuer = "http://#{SecureRandom.alphanumeric 10}.com"
    lms_client_id = SecureRandom.uuid
    id_token = {
      sub: lms_user_id,
      aud: lms_client_id,
      iss: lms_issuer,
    }
    user.authentication_options.create(
      authentication_id: Services::Lti::AuthIdGenerator.new(id_token).call,
      credential_type: AuthenticationOption::LTI_V1,
    )
    mock_nrps_member = {
      user_id: lms_user_id,
    }

    assert_equal user, Queries::Lti.get_user_from_nrps(client_id: lms_client_id, issuer: lms_issuer, nrps_member: mock_nrps_member)
  end

  test 'finds an LTI Deployment given an LTI integration id and a deployment id' do
    lti_integration = create :lti_integration
    lti_deployment = create :lti_deployment, lti_integration: lti_integration

    assert_equal lti_deployment, Queries::Lti.get_deployment(lti_integration.id, lti_deployment.deployment_id)
  end

  test 'finds an LTI Course given an LTI integration id and an LTI context id' do
    lti_integration = create :lti_integration
    context_id = SecureRandom.uuid
    lti_course = create :lti_course, lti_integration: lti_integration, context_id: context_id

    assert_equal lti_course, Queries::Lti.get_course_from_context(lti_integration.id, context_id)
  end

  test 'finds an LTI Course given a section code' do
    section_code = SecureRandom.alphanumeric(6)
    lti_course = create :lti_course
    create :lti_section, lti_course: lti_course, section: create(:section, code: section_code)

    assert_equal lti_course, Queries::Lti.get_lti_course_from_section_code(section_code)
  end

  test 'creates an LTI course given metadata from an LTI launch ID token' do
    lti_integration = create :lti_integration
    lti_course = Queries::Lti.find_or_create_lti_course(lti_integration_id: lti_integration.id, context_id: 'context-id', deployment_id: 'deployment-id', nrps_url: 'http://some-nrps-url.com', resource_link_id: 'rlid')
    assert lti_course
  end

  test 'finds an existing LTI course given metadata from an LTI launch ID token' do
    lti_integration = create :lti_integration
    lti_course = create :lti_course, lti_integration: lti_integration, context_id: SecureRandom.uuid
    assert_equal lti_course, Queries::Lti.find_or_create_lti_course(lti_integration_id: lti_integration.id, context_id: lti_course.context_id, deployment_id: 'deployment-id', nrps_url: 'http://some-nrps-url.com', resource_link_id: 'rlid')
  end

  test 'lti_user_id should return the subject (user id) for a given user' do
    lti_integration = create :lti_integration
    lti_user_identity = create :lti_user_identity, lti_integration: lti_integration

    assert_equal "subject", Queries::Lti.lti_user_id(lti_user_identity.user, lti_integration)
  end

  test 'lti_user_id should return nil if there are no matching identities' do
    lti_integration = create :lti_integration
    other_lti_integration = create :lti_integration
    lti_user_identity = create :lti_user_identity, lti_integration: lti_integration

    assert_nil Queries::Lti.lti_user_id(lti_user_identity.user, other_lti_integration)
  end
end
