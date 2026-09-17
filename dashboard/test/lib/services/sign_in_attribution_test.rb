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
    assert_nil @request.env[Services::SignInAttribution::EVENT_TYPE_KEY]
    assert_nil @request.env[Services::SignInAttribution::AUTHENTICATION_OPTION_ID_KEY]
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
  # winning_strategy outlives the set_user that produced it, so a later programmatic
  # sign_in must not inherit the credentials of an earlier authentication. Under strict
  # mode that shows up as a refusal to guess rather than as a wrong answer.
  test 'a strategy is ignored unless it authenticated this set_user' do
    strategy = Devise::Strategies::DatabaseAuthenticatable.new(@request.env)
    strategy.authentication_hash = {hashed_email: @user.primary_contact_info.hashed_email}
    @request.env['warden'] = stub(winning_strategy: strategy)
    @request.env[Services::SignInAttribution::WARDEN_EVENT_KEY] = :set_user

    assert_raises(Services::SignInAttribution::UnattributedSignIn) do
      Services::SignInAttribution.resolve(@user, @request)
    end
  end

  # Warden's login_as helper claims :authentication with no strategy behind it, on
  # whichever request comes next. Those rows are harness artifacts, not a missing path,
  # and every integration test that signs a user in would otherwise fail.
  test 'the warden test helper signing a user in is not treated as a missing path' do
    @request.env['warden'] = stub(winning_strategy: nil)
    @request.env[Services::SignInAttribution::WARDEN_EVENT_KEY] = :authentication

    assert_equal [nil, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  test 'a sign-in nothing accounts for raises where failures get seen' do
    error = assert_raises(Services::SignInAttribution::UnattributedSignIn) do
      Services::SignInAttribution.resolve(@user, @request)
    end

    assert_match 'no attribution', error.message
  end

  # Production behaviour: report it and record NULL, which is what a row written before
  # the column existed also holds.
  test 'a sign-in nothing accounts for is reported and stored as null elsewhere' do
    Services::SignInAttribution.stubs(:raise_attribution_errors?).returns(false)
    Observability::Errors.expects(:report).once

    assert_equal [nil, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  # The point of the rescue: a sign-in must not fail because labelling it did.
  test 'an error while attributing never breaks a sign-in outside those environments' do
    Services::SignInAttribution.stubs(:raise_attribution_errors?).returns(false)
    Services::SignInAttribution.stubs(:from_warden_strategy).raises(Mysql2::Error.new('gone'))
    Observability::Errors.expects(:report).once

    assert_equal [nil, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  test 'a failure to report never breaks a sign-in either' do
    Services::SignInAttribution.stubs(:raise_attribution_errors?).returns(false)
    Services::SignInAttribution.stubs(:from_warden_strategy).raises(Mysql2::Error.new('gone'))
    Observability::Errors.stubs(:report).raises(StandardError.new('honeybadger is down'))

    assert_equal [nil, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  test 'an error while attributing surfaces where failures get seen' do
    Services::SignInAttribution.stubs(:from_warden_strategy).raises(Mysql2::Error.new('gone'))

    assert_raises(Mysql2::Error) {Services::SignInAttribution.resolve(@user, @request)}
  end

  private def stub_winning_strategy(strategy)
    @request.env['warden'] = stub(winning_strategy: strategy)
    @request.env[Services::SignInAttribution::WARDEN_EVENT_KEY] = :authentication
  end
end
