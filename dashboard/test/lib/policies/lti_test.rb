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
      Policies::Lti::LTI_CUSTOM_CLAIMS => {
        email: 'test@code.org'
      }
    }

    @user = create :user
    @user.authentication_options.create(
      authentication_id: Policies::Lti.generate_auth_id(@id_token),
      credential_type: AuthenticationOption::LTI_V1,
    )
  end

  test 'get_account_type should return a teacher if id_token has TEACHER_ROLES' do
    @id_token[@roles_key] = @teacher_roles
    assert_equal Policies::Lti.get_account_type(@id_token[Policies::Lti::LTI_ROLES_KEY]), User::TYPE_TEACHER
  end

  test 'get_account_type should return a student if id_token does not have TEACHER_ROLES' do
    @id_token[@roles_key] = ['not-a-teacher-role']
    assert_equal Policies::Lti.get_account_type(@id_token[Policies::Lti::LTI_ROLES_KEY]), User::TYPE_STUDENT
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

  class EarlyAccessTest < ActiveSupport::TestCase
    setup do
      @lti_early_access_limit = DCDO.stubs(:get).with('lti_early_access_limit', false)
    end

    test 'returns false when DCDO `lti_early_access_limit` is false' do
      @lti_early_access_limit.returns(false)

      assert_equal false, Policies::Lti.early_access?
    end

    test 'returns true when DCDO `lti_early_access_limit` is true' do
      @lti_early_access_limit.returns(true)

      assert_equal true, Policies::Lti.early_access?
    end

    test 'returns true when DCDO `lti_early_access_limit` is an integer' do
      @lti_early_access_limit.returns(100)

      assert_equal true, Policies::Lti.early_access?
    end
  end

  class EarlyAccessClosedTest < ActiveSupport::TestCase
    setup do
      @lti_early_access_limit = DCDO.stubs(:get).with('lti_early_access_limit', false)
      @early_access = Policies::Lti.stubs(:early_access?)
    end

    test 'returns nil unless early access' do
      @early_access.returns(false)

      assert_equal nil, Policies::Lti.early_access_closed?
    end

    test 'returns true when DCDO `lti_early_access_limit` is true' do
      @early_access.returns(true)
      @lti_early_access_limit.returns(true)

      assert_equal false, Policies::Lti.early_access_closed?
    end

    test 'returns false when DCDO `lti_early_access_limit` is false' do
      @early_access.returns(true)
      @lti_early_access_limit.returns(false)

      assert_equal false, Policies::Lti.early_access_closed?
    end

    test 'returns false when LTI integration count is less than DCDO `lti_early_access_limit`' do
      @early_access.returns(true)
      @lti_early_access_limit.returns(LtiIntegration.count.next)

      assert_equal false, Policies::Lti.early_access_closed?
    end

    test 'returns true when LTI integration count is greater than DCDO `lti_early_access_limit`' do
      @early_access.returns(true)
      @lti_early_access_limit.returns(LtiIntegration.count.pred)

      assert_equal true, Policies::Lti.early_access_closed?
    end

    test 'returns true when LTI integration count is equal to DCDO `lti_early_access_limit`' do
      @early_access.returns(true)
      @lti_early_access_limit.returns(LtiIntegration.count)

      assert_equal true, Policies::Lti.early_access_closed?
    end
  end

  class ShowEarlyAccessBannerTest < ActiveSupport::TestCase
    setup do
      @user = build(:teacher)

      Policies::Lti.stubs(:early_access?).returns(true)
      Policies::Lti.stubs(:lti?).with(@user).returns(true)
    end

    test 'returns true when early access and user is LTI' do
      assert Policies::Lti.show_early_access_banner?(@user)
    end

    test 'returns false when early access is not enabled' do
      Policies::Lti.stubs(:early_access?).returns(false)

      refute Policies::Lti.show_early_access_banner?(@user)
    end

    test 'returns false when user is not LTI' do
      Policies::Lti.stubs(:lti?).with(@user).returns(false)

      refute Policies::Lti.show_early_access_banner?(@user)
    end
  end
end
