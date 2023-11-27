require 'test_helper'
require 'user'
require 'policies/lti'
require 'authentication_option'

class Services::LtiTest < ActiveSupport::TestCase
  test 'get_user returns an existing user' do
    user = create :user
    id_token = {
      sub: 'some-sub',
      aud: 'some-aud',
      iss: 'http://some-iss.com',
    }
    user.authentication_options.create(
      authentication_id: Policies::Lti.generate_auth_id(id_token),
      credential_type: AuthenticationOption::LTI_V1,
    )

    assert_equal user, Queries::Lti.get_user(id_token)
  end
end
