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

  test 'lti_provided_email should return the :email stored in the LTI option given LTI user' do
    user = create :teacher, :with_lti_auth
    assert_equal user.email, Policies::Lti.lti_provided_email(user)
  end

  test 'lti_provided_email should NOT return an email given a non-LTI user' do
    user = create :teacher
    assert_equal nil, Policies::Lti.lti_provided_email(user)
  end

  test 'show_email_input?' do
    test_matrix = [
      [true, [:teacher, :with_lti_auth]],
      [false, [:teacher]],
      [false, [:student, :with_lti_auth]],
      [false, [:student]],
    ]
    test_matrix.each do |expected, traits|
      user = create(*traits)
      actual = Policies::Lti.show_email_input?(user)
      failure_msg = "Expected show_email_input?(#{traits}) to be #{expected} but it was #{actual}"
      assert_equal expected, actual, failure_msg
    end
  end
end
