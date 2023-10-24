require 'test_helper'
require 'user'
require 'policies/lti'
require 'authentication_option'

class Services::LtiTest < ActiveSupport::TestCase
  test 'get_user returns an existing user' do
    user = create :user
    id_token = {
      sub: '12345-a314-4215-b03e-58fe1bd3c8b0',
      aud: '10000000000001',
      iss: 'https://some-lms.com',
      email: 'teacher@gmail.com',
    }
    user.authentication_options.create(
      authentication_id: Policies::Lti.generate_auth_id(id_token),
      credential_type: AuthenticationOption::LTI_V1,
      email: id_token[:email],
    )

    assert_equal user, Queries::Lti.get_user(id_token)
  end
end
