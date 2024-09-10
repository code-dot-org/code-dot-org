require 'test_helper'

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
      },
      'school_info_attributes' => {
        'country' => 'US',
        'school_type' => 'public',
        'school_state' => 'Washington',
        'school_name' => 'Test School',
        'school_zip' => '99999'
      }
    }
    user = User.new(name: 'original_name')
    ao = AuthenticationOption.new(user: user, email: 'original@example.com')
    user.authentication_options = [ao]

    Services::User.assign_form_params(user, params)

    assert_equal expected_name, user.name
    assert_equal expected_email, user.authentication_options.first.email
    assert_equal user.school_info.school_name, params.dig('school_info_attributes', 'school_name')
  end
end
