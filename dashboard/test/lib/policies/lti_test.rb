require 'test_helper'
require 'user'
require 'policies/lti'

class Policies::LtiTest < ActiveSupport::TestCase
  setup do
    @ids = ['http://some-iss.com', 'some-aud', 'some-sub'].freeze
    @roles_key = Policies::Lti::LTI_ROLES_KEY
    @teacher_roles = [
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator',
      'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Instructor',
      'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#SysAdmin',
      'http://purl.imsglobal.org/vocab/lis/v2/system/person#User',
    ]

    @id_token = {
      sub: @ids[2],
      aud: @ids[1],
      iss: @ids[0],
    }

    @user = create :user
    @user.authentication_options.create(
      authentication_id: Policies::Lti.generate_auth_id(@id_token),
      credential_type: AuthenticationOption::LTI_V1,
    )
  end

  test 'get_account_type should return a teacher if id_token has TEACHER_ROLES' do
    @id_token[@roles_key] = @teacher_roles
    assert_equal Policies::Lti.get_account_type(@id_token), User::TYPE_TEACHER
  end

  test 'get_account_type should return a student if id_token does not have TEACHER_ROLES' do
    @id_token[@roles_key] = ['not-a-teacher-role']
    assert_equal Policies::Lti.get_account_type(@id_token), User::TYPE_STUDENT
  end

  test 'generate_auth_id should create authentication_id string' do
    assert_equal Policies::Lti.generate_auth_id(@id_token), @ids.join('|')
  end

  test 'issuer should return the issuer of the LTI Platform from a users LTI authentication_options' do
    assert_equal @ids[0], Policies::Lti.issuer(@user)
  end

  test 'lti? should determine if user is an LTI user' do
    assert Policies::Lti.lti?(@user)
    auth_option = @user.authentication_options.find {|ao| ao.credential_type == AuthenticationOption::LTI_V1}
    auth_option.update!(authentication_id: 'not-lti', credential_type: 'not-lti')
    refute Policies::Lti.lti?(@user)
  end
end
