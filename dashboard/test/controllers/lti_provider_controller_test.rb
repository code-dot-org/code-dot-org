require 'test_helper'

class LtiProviderControllerTest < ActionController::TestCase
  include Mocha::API

  def lti_consumer_params(consumer_key, consumer_secret, test_name, *args)

    # match URL used by MiniTest post :sso call
    tc = IMS::LTI::ToolConfig.new(title: 'Test LTI Provider',
                                  launch_url: 'http://test.host/auth/lti')

    @consumer = IMS::LTI::ToolConsumer.new(consumer_key, consumer_secret)
    @consumer.set_config(tc)

    # Set some launch data, see:
    # http://www.imsglobal.org/LTI/v1p1pd/ltiIMGv1p1pd.html#_Toc309649684
    #
    # Only this first attribute is required, the rest are recommended.
    # Just use the MiniTest test name
    @consumer.resource_link_id = test_name

    # Now, LTI SSO for CDO also requires email. Name will either be the
    # passed in name or the email.
    args[0].each do |k,v|
      @consumer.send("#{k}=", v)
    end

    @consumer.generate_launch_data
  end

  # For MiniTest need to have params passed through both query params and
  # request body
  def lti_post(action, params)
    @request.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    post action, params.to_param, params
  end

  test "LTI sign-in with existing CDO account, signs in" do
    user = create(:student)

    params = lti_consumer_params(
      'f10ee9fc082219227976f2c1603a3d77',
      'dc3872a4b605f1f36242a837172ce2c0', method_name,
      lis_person_contact_email_primary: user.email,
      lis_person_name_full: user.name)

    lti_post :sso, params

    assert_equal user.id, session['warden.user.user.key'].first.first
  end

  test "LTI sign-in with new email and no :role, creates new Student account" do
    params = lti_consumer_params(
      'f10ee9fc082219227976f2c1603a3d77',
      'dc3872a4b605f1f36242a837172ce2c0', method_name,
      lis_person_contact_email_primary: 'cat@hat.com',
      lis_person_name_full: 'Cat Hat')

    assert_creates(User) do
      lti_post :sso, params
    end

    # Role not specified so create Student user, 8 years old
    user = User.last
    assert_equal 'Cat Hat', user.name
    assert_equal User.hash_email('cat@hat.com'), user.hashed_email
    assert_equal User::TYPE_STUDENT, user.user_type
    assert_equal 8, user.age

    # LTI does not typically send gender
    assert_equal nil, user.gender
  end

  test "LTI sign-in with new email can also create new Teacher account" do
    params = lti_consumer_params(
      'f10ee9fc082219227976f2c1603a3d77',
      'dc3872a4b605f1f36242a837172ce2c0', method_name,
      lis_person_contact_email_primary: 'cat@hat.com',
      lis_person_name_full: 'Cat Hat',
      roles: 'Instructor')

    assert_creates(User) do
      lti_post :sso, params
    end

    # Teachers are defined to be 21 years old, emails are stored
    user = User.last
    assert_equal 'Cat Hat', user.name
    assert_equal 'cat@hat.com', user.email
    assert_equal User::TYPE_TEACHER, user.user_type
    assert_equal "21+", user.age
  end

  test "LTI sign-in can also handle multiple LTI roles" do
    params = lti_consumer_params(
      'f10ee9fc082219227976f2c1603a3d77',
      'dc3872a4b605f1f36242a837172ce2c0', method_name,
      lis_person_contact_email_primary: 'cat@hat.com',
      lis_person_name_full: 'Cat Hat',
      roles: 'Instructor, TeachingAssistant, ContentDeveloper')

    assert_creates(User) do
      lti_post :sso, params
    end

    user = User.last
    assert_equal 'Cat Hat', user.name
    assert_equal 'cat@hat.com', user.email
    assert_equal User::TYPE_TEACHER, user.user_type
  end

  test "LTI sign-in can also handle multiple Learner roles (edge case)" do
    params = lti_consumer_params(
      'f10ee9fc082219227976f2c1603a3d77',
      'dc3872a4b605f1f36242a837172ce2c0', method_name,
      lis_person_contact_email_primary: 'cat@hat.com',
      lis_person_name_full: 'Cat Hat',
      roles: 'Learner,Learner')

    assert_creates(User) do
      lti_post :sso, params
    end

    user = User.last
    assert_equal 'Cat Hat', user.name
    assert_equal User.hash_email('cat@hat.com'), user.hashed_email
    assert_equal User::TYPE_STUDENT, user.user_type
  end

  test "LTI sign-in creates new User with no password and provider set" do
    consumer_key = 'f10ee9fc082219227976f2c1603a3d77'

    params = lti_consumer_params(
      consumer_key,
      'dc3872a4b605f1f36242a837172ce2c0', method_name,
      lis_person_contact_email_primary: 'cat@hat.com',
      lis_person_name_full: 'Cat Hat',
      roles: 'Learner,Learner')

    assert_creates(User) do
      lti_post :sso, params
    end

    user = User.last
    assert_equal "lti_#{consumer_key}", user.provider
    assert_nil user.password
  end



  test "LTI sign-in with no email does not sign in" do
    params = lti_consumer_params(
      'f10ee9fc082219227976f2c1603a3d77',
      'dc3872a4b605f1f36242a837172ce2c0', method_name,
      lis_person_name_full: 'Cat Hat')

    assert_does_not_create(User) do
      lti_post :sso, params
    end

    assert_redirected_to 'http://test.host/users/sign_up'
    assert_match /email missing/, session['flash'].to_s
  end

  test "LTI sign-in with bad oauth_timestamp does not sign in" do
    params = lti_consumer_params(
      'f10ee9fc082219227976f2c1603a3d77',
      'dc3872a4b605f1f36242a837172ce2c0', method_name,
      oauth_timestamp: Time.now.to_i - 6.minutes,
      lis_person_contact_email_primary: 'cat@hat.com',
      lis_person_name_full: 'Cat Hat')

    assert_does_not_create(User) do
      lti_post :sso, params
    end

    assert_redirected_to 'http://test.host/users/sign_up'
    assert_match /launch request outside of time window/, session['flash'].to_s
  end
end
