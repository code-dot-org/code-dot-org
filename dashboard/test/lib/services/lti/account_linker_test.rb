require 'test_helper'

class Services::Lti::AccountLinkerTest < ActiveSupport::TestCase
  setup do
    @user = create :teacher
    @session = {}
    @lti_integration = create :lti_integration
  end

  test 'reassigns an auth option from a partial registration to an existing user' do
    partial_lti_teacher = create :teacher
    ao = create :lti_authentication_option
    fake_id_token = {iss: @lti_integration.issuer, aud: @lti_integration.client_id, sub: 'foo'}
    auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
    ao.update(authentication_id: auth_id)
    partial_lti_teacher.authentication_options = [ao]
    PartialRegistration.persist_attributes @session, partial_lti_teacher
    assert_equal 1, @user.authentication_options.count
    refute Policies::Lti.lti?(@user)

    Services::Lti::AccountLinker.call(user: @user, session: @session)
    assert_equal 2, @user.reload.authentication_options.count
    assert Policies::Lti.lti?(@user)
  end
end
