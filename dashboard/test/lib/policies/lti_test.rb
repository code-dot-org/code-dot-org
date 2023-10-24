require 'test_helper'
require 'user'
# require 'authentication_option'
# require 'pry'

class Policies::LtiTest < ActiveSupport::TestCase
  ids = ['http://some-iss.com', 'some-aud', 'some-sub'].freeze
  teacher_id_token = {
    sub: ids[2],
    aud: ids[1],
    iss: ids[0],
    'https://purl.imsglobal.org/spec/lti/claim/roles' => [
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator',
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Instructor',
      'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#SysAdmin',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#User',
    ],
  }

  student_id_token = {
    'https://purl.imsglobal.org/spec/lti/claim/roles' => [
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student',
      'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#None',
    ],
  }

  test 'get_account_type should return a teacher if id_token has TEACHER_ROLES' do
    assert_equal Policies::Lti.get_account_type(teacher_id_token), User::TYPE_TEACHER
  end

  test 'get_account_type should return a student if id_token does not have TEACHER_ROLES' do
    assert_equal Policies::Lti.get_account_type(student_id_token), User::TYPE_STUDENT
  end

  test 'generate_auth_id should create authentication_id string' do
    assert_equal Policies::Lti.generate_auth_id(teacher_id_token), ids.join('|')
  end
end
