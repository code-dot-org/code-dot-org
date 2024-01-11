require 'test_helper'
require 'user'
require 'services/user'

class Services::UserTest < ActiveSupport::TestCase
  test 'assign_form_params should update user with given params' do
    expected_name = 'updated_name'
    expected_email = "updated@example.com"
    params = {
      'name' => expected_name,
      'authentication_options_attributes' => {
        '0' => {
          'email' => expected_email
        }
      }
    }
    user = User.new(name: 'original_name')
    ao = AuthenticationOption.new(user: user, email: 'original@example.com')
    user.authentication_options = [ao]

    Services::User.assign_form_params(user, params)

    assert_equal expected_name, user.name
    assert_equal expected_email, user.authentication_options.first.email
  end
end
