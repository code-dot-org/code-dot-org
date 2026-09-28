require 'test_helper'

class Services::SignInAttributionTest < ActiveSupport::TestCase
  setup do
    @user = create(:teacher)
    @request = ActionDispatch::TestRequest.create
    DCDO.set('sign_in_attribution_enabled', true)
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

  # Every sign-in this does not yet account for -- OmniAuth, LTI, section codes,
  # registration -- records a NULL event_type rather than a wrong one.
  test 'a sign-in it cannot account for is left undetermined' do
    assert_equal [nil, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  # Everything below is about the guarantee that signing in cannot fail because of how we
  # label the event. Each entry point runs inside the sign-in path, so each is checked.

  test 'an error while attributing never breaks a sign-in in production' do
    Services::SignInAttribution.stubs(:raise_attribution_errors?).returns(false)
    Services::SignInAttribution.stubs(:from_warden_strategy).raises(Mysql2::Error.new('gone'))
    Observability::Errors.expects(:report).once

    assert_equal [nil, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  test 'an error while extracting never breaks a sign-in in production' do
    Services::SignInAttribution.stubs(:raise_attribution_errors?).returns(false)
    Services::SignInAttribution.stubs(:declare).raises(StandardError.new('boom'))
    Observability::Errors.expects(:report).once

    assert_nothing_raised do
      Services::SignInAttribution.extract!(@request, [@user, {event_type: SignIn::CREDENTIAL}])
    end
  end

  test 'an error recording the warden event never breaks a sign-in in production' do
    Services::SignInAttribution.stubs(:raise_attribution_errors?).returns(false)
    Observability::Errors.expects(:report).once
    warden = stub
    warden.stubs(:request).raises(StandardError.new('boom'))

    assert_nothing_raised do
      Services::SignInAttribution.record_warden_event(warden, {event: :authentication})
    end
  end

  # Swallowing in production is only safe because it is loud everywhere a human looks.
  test 'an error while attributing surfaces where failures get seen' do
    Services::SignInAttribution.stubs(:from_warden_strategy).raises(Mysql2::Error.new('gone'))

    assert_raises(Mysql2::Error) {Services::SignInAttribution.resolve(@user, @request)}
  end

  test 'a failure to report never breaks a sign-in either' do
    Services::SignInAttribution.stubs(:raise_attribution_errors?).returns(false)
    Services::SignInAttribution.stubs(:from_warden_strategy).raises(Mysql2::Error.new('gone'))
    Observability::Errors.stubs(:report).raises(StandardError.new('honeybadger is down'))

    assert_equal [nil, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  test 'the DCDO switch turns attribution off without touching the sign-in' do
    DCDO.stubs(:get).with('sign_in_attribution_enabled', false).returns(false)
    option = @user.primary_contact_info
    args = [@user, {event_type: SignIn::CREDENTIAL, authentication_option: option}]

    Services::SignInAttribution.extract!(@request, args)

    assert_equal [nil, nil], Services::SignInAttribution.resolve(@user, @request)
    assert_equal SignIn::CREDENTIAL, @request.env[Services::SignInAttribution::EVENT_TYPE_KEY]
  end

  # A config backend having a bad day must not take logins with it.
  test 'a failure reading the DCDO switch never breaks a sign-in in production' do
    Services::SignInAttribution.stubs(:raise_attribution_errors?).returns(false)
    DCDO.stubs(:get).raises(StandardError.new('dcdo is down'))
    Observability::Errors.expects(:report).once

    assert_equal [nil, nil], Services::SignInAttribution.resolve(@user, @request)
  end

  private def stub_winning_strategy(strategy)
    @request.env['warden'] = stub(winning_strategy: strategy)
    @request.env[Services::SignInAttribution::WARDEN_EVENT_KEY] = :authentication
  end
end
