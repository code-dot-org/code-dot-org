require 'test_helper'

class Services::SignInAttributionTest < ActiveSupport::TestCase
  setup do
    @user = create(:teacher)
    @request = ActionDispatch::TestRequest.create
  end

  test 'a declared event type and credential win over anything derivable' do
    option = @user.primary_contact_info
    Services::SignInAttribution.declare(@request, SignIn::SECTION_CODE, authentication_option: option)

    assert_equal [SignIn::SECTION_CODE, option.id], Services::SignInAttribution.resolve(@user, @request)
  end

  test 'a declaration without a credential resolves the event type alone' do
    Services::SignInAttribution.declare(@request, SignIn::REAUTHENTICATION)

    assert_equal [SignIn::REAUTHENTICATION, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  test 'extract! moves our options off a sign_in call and leaves the rest for devise' do
    option = @user.primary_contact_info
    args = [@user, {event_type: SignIn::CREDENTIAL, authentication_option: option, scope: :user}]

    Services::SignInAttribution.extract!(@request, args)

    assert_equal({scope: :user}, args.last)
    assert_equal [SignIn::CREDENTIAL, option.id], Services::SignInAttribution.resolve(@user, @request)
  end

  test 'extract! leaves a call that declares nothing alone' do
    args = [@user]

    Services::SignInAttribution.extract!(@request, args)

    assert_equal [@user], args
    assert_equal [nil, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  test 'an omniauth callback is attributed to the credential its auth hash names' do
    option = create(:authentication_option, user: @user, credential_type: AuthenticationOption::GOOGLE)
    @request.env['omniauth.auth'] = OmniAuth::AuthHash.new(
      provider: option.credential_type,
      uid: option.authentication_id
    )

    assert_equal [SignIn::CREDENTIAL, option.id], Services::SignInAttribution.resolve(@user, @request)
  end

  test 'an omniauth callback for an unknown credential is still a credential sign-in' do
    @request.env['omniauth.auth'] = OmniAuth::AuthHash.new(
      provider: AuthenticationOption::GOOGLE,
      uid: 'belongs-to-nobody'
    )

    assert_equal [SignIn::CREDENTIAL, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  test 'a remember-me cookie is not a credential the user presented' do
    stub_winning_strategy Devise::Strategies::Rememberable.new(@request.env)

    assert_equal [SignIn::REMEMBERED, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  test 'a password sign-in resolves the email credential it was checked against' do
    strategy = Devise::Strategies::DatabaseAuthenticatable.new(@request.env)
    strategy.authentication_hash = {hashed_email: @user.primary_contact_info.hashed_email}
    stub_winning_strategy strategy

    assert_equal [SignIn::CREDENTIAL, @user.primary_contact_info.id],
      Services::SignInAttribution.resolve(@user, @request)
  end

  test 'a username sign-in is a credential sign-in with no credential to name' do
    strategy = Devise::Strategies::DatabaseAuthenticatable.new(@request.env)
    strategy.authentication_hash = {login: 'some-username'}
    stub_winning_strategy strategy

    assert_equal [SignIn::CREDENTIAL, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  # winning_strategy outlives the set_user that produced it, so a later programmatic
  # sign_in must not inherit the credentials of an earlier authentication.
  test 'a strategy is ignored unless it authenticated this set_user' do
    strategy = Devise::Strategies::DatabaseAuthenticatable.new(@request.env)
    strategy.authentication_hash = {hashed_email: @user.primary_contact_info.hashed_email}
    @request.env['warden'] = stub(winning_strategy: strategy)
    @request.env[Services::SignInAttribution::WARDEN_EVENT_KEY] = :set_user

    assert_equal [nil, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  # Every sign-in this does not yet account for -- LTI, section codes, registration --
  # records a NULL event_type rather than a wrong one.
  test 'a sign-in it cannot account for is left undetermined' do
    assert_equal [nil, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  private def stub_winning_strategy(strategy)
    @request.env['warden'] = stub(winning_strategy: strategy)
    @request.env[Services::SignInAttribution::WARDEN_EVENT_KEY] = :authentication
  end
end
