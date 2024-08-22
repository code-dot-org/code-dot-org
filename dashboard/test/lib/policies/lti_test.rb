require 'test_helper'

class Policies::LtiTest < ActiveSupport::TestCase
  setup do
    @ids = ['http://some-iss.com', ['some-aud'], 'some-sub'].freeze
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
      authentication_id: Services::Lti::AuthIdGenerator.new(@id_token).call,
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

  test 'issuer should return the issuer of the LTI Platform from a users LTI authentication_options' do
    assert_equal @ids[0], Policies::Lti.issuer(@user)
  end

  test 'lti? should determine if user is an LTI user' do
    assert Policies::Lti.lti?(@user)
    auth_option = @user.authentication_options.find {|ao| ao.credential_type == AuthenticationOption::LTI_V1}
    auth_option.update!(authentication_id: 'not-lti', credential_type: 'not-lti')
    refute Policies::Lti.lti?(@user)
  end

  test 'find_platform_by_issuer should return the platform object or nil if it does not exist' do
    valid_issuer = 'https://canvas.instructure.com'
    invalid_issuer = 'https://fake.com'
    assert Policies::Lti.find_platform_by_issuer(valid_issuer)
    assert_nil Policies::Lti.find_platform_by_issuer(invalid_issuer)
  end

  test 'find_platform_name_by_issuer should return the platform name (string) or empty string if it does not exist' do
    valid_issuer = 'https://canvas.instructure.com'
    invalid_issuer = 'https://fake.com'
    assert Policies::Lti.find_platform_name_by_issuer(valid_issuer)
    assert_empty Policies::Lti.find_platform_name_by_issuer(invalid_issuer)
  end

  test 'lti_provided_email should return the :email stored in the LTI option given LTI user' do
    user = create :teacher, :with_lti_auth
    assert_equal user.email, Policies::Lti.lti_provided_email(user)
  end

  test 'lti_provided_email should NOT return an email given a non-LTI user' do
    user = create :teacher
    assert_nil Policies::Lti.lti_provided_email(user)
  end

  test 'lti_teacher returns false if administrator' do
    assert_equal false, Policies::Lti.lti_teacher?(["http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator"])
  end

  test 'lti_teacher returns false if learner' do
    assert_equal false, Policies::Lti.lti_teacher?([Policies::Lti::CONTEXT_LEARNER_ROLE])
  end

  test 'lti_teacher returns true if instructor' do
    assert_equal true, Policies::Lti.lti_teacher?(['http://purl.imsglobal.org/vocab/lis/v1/institution/person#Instructor'])
  end

  def create_opted_out_user
    user = create :student, :with_lti_auth
    user.lms_landing_opted_out = false
    user.save

    user
  end

  test 'account_linking returns true if session initialized, single LTI auth, and not opted out' do
    user = create_opted_out_user

    session = {}
    Services::Lti.initialize_lms_landing_session(session, 'canvas_cloud', 'new', user.user_type)

    assert_equal true, Policies::Lti.account_linking?(session, user)
  end

  test 'account_linking returns false if session is not initialized' do
    user = create_opted_out_user

    session = {}

    assert_equal false, Policies::Lti.account_linking?(session, user)
  end

  test 'account_linking returns false if session initialized, with multiple LTI auth' do
    user = create_opted_out_user
    google_auth = create(:google_authentication_option, user: user)
    user.authentication_options << google_auth
    user.save

    session = {}
    Services::Lti.initialize_lms_landing_session(session, 'canvas_cloud', 'new', user.user_type)

    assert_equal false, Policies::Lti.account_linking?(session, user)
  end

  test 'account_linking returns false if session initialized, single LTI auth, and opted out' do
    user = create_opted_out_user
    user.lms_landing_opted_out = true
    user.save

    session = {}
    Services::Lti.initialize_lms_landing_session(session, 'canvas_cloud', 'new', user.user_type)

    assert_equal false, Policies::Lti.account_linking?(session, user)
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

  test 'force_iframe_launch? should return true for Schoology and false for other LMS platforms' do
    assert Policies::Lti.force_iframe_launch?('https://schoology.schoology.com')
    refute Policies::Lti.force_iframe_launch?('https://canvas.instructure.com')
  end

  class FeedbackAvailabilityTest < ActiveSupport::TestCase
    test 'returns true when user is a teacher, LTI user and created more than 2 days ago' do
      user = create(:teacher, :with_lti_auth, created_at: 3.days.ago)

      assert Policies::Lti.feedback_available?(user)
    end

    test 'returns false when user is not a teacher' do
      user = create(:student, :with_lti_auth, created_at: 3.days.ago)

      refute Policies::Lti.feedback_available?(user)
    end

    test 'returns false when user is not an LTI user' do
      user = create(:teacher, created_at: 3.days.ago)

      refute Policies::Lti.feedback_available?(user)
    end

    test 'returns false when user is created less than 2 days ago' do
      user = create(:teacher, :with_lti_auth, created_at: 1.day.ago)

      refute Policies::Lti.feedback_available?(user)
    end
  end

  class InProgressRegistrationTest < ActiveSupport::TestCase
    test 'returns true for a partial LTI registration' do
      session = {}
      partial_lti_teacher = create :teacher
      lti_integration = create :lti_integration
      fake_id_token = {iss: lti_integration.issuer, aud: lti_integration.client_id, sub: 'foo'}
      auth_id = Services::Lti::AuthIdGenerator.new(fake_id_token).call
      ao = AuthenticationOption.new(
        authentication_id: auth_id,
        credential_type: AuthenticationOption::LTI_V1,
        email: partial_lti_teacher.email,
      )
      partial_lti_teacher.authentication_options = [ao]
      PartialRegistration.persist_attributes session, partial_lti_teacher

      assert Policies::Lti.lti_registration_in_progress?(session)
    end

    test 'returns false for a partial non-LTI registration' do
      session = {}
      partial_teacher = create :teacher, :with_google_authentication_option
      PartialRegistration.persist_attributes session, partial_teacher

      refute Policies::Lti.lti_registration_in_progress?(session)
    end
  end
end
