require 'test_helper'
require 'user'
require 'authentication_option'
require 'policies/lti'
require 'pry'

class Services::LtiTest < ActiveSupport::TestCase
  id_token = {
    sub: '12345-a314-4215-b03e-58fe1bd3c8b0',
    aud: '10000000000001',
    iss: 'https://some-lms.com',
    name: 'Han Solo',
    given_name: 'Han',
    family_name: 'Solo',
    'https://purl.imsglobal.org/spec/lti/claim/roles' => [
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator',
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Instructor',
      'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#SysAdmin',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#User',
    ],
  }

  student_id_token = {
    sub: '67890-a314-4215-b03e-58fe1bd3c8b0',
    aud: '10000000000001',
    iss: 'https://some-lms.com',
    name: 'Luke Skywalker',
    given_name: 'Luke',
    family_name: 'Skywalker',
    'https://purl.imsglobal.org/spec/lti/claim/roles' => [
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student',
      'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#None',
    ],
  }

  setup do
    User.all.destroy_all
  end

  test 'partially_create_user should create User::TYPE_TEACHER when id_token contains teacher/admin roles' do
    user = Services::Lti.partially_create_user(id_token)
    user.save
    assert user
    assert_equal user.user_type, User::TYPE_TEACHER
    assert_equal user.name, id_token[:name]
    assert_equal 1, user.authentication_options.count
    assert_equal user.authentication_options[0].credential_type, AuthenticationOption::LTI_V1
    assert_equal user.authentication_options[0].authentication_id, Policies::Lti.generate_auth_id(id_token)
  end

  test 'partially_create_user should create User::TYPE_STUDENT when id_token contains student roles' do
    student_user = Services::Lti.partially_create_user(student_id_token)
    student_user.save
    assert student_user
    assert_equal student_user.user_type, User::TYPE_STUDENT
    assert_equal student_user.name, student_id_token[:given_name]
    assert_equal student_user.family_name, student_id_token[:family_name]
  end
end
