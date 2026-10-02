require 'test_helper'

class UserLogTokenableTest < ActiveSupport::TestCase
  DESTINATION = User::LogToken::SENTRY

  setup do
    @user = create(:student)
    Rails.cache.clear
  end

  teardown do
    Rails.cache.clear
  end

  it 'derives a token for a user' do
    assert_equal User::LogToken.token_for(@user.id, destination: DESTINATION),
      @user.log_token(destination: DESTINATION)
  end

  # The admin lookup page holds an id but deliberately never loads the row.
  it 'derives a token from a bare user id' do
    assert_equal @user.log_token(destination: DESTINATION),
      User.log_token_for(@user.id, destination: DESTINATION)
  end

  it 'resolves a token back to its user id' do
    token = @user.log_token(destination: DESTINATION)

    assert_equal @user.id, User.resolve_log_token(token, actor_id: 1, reason: 'test')[:user_id]
  end

  # The Warden hook asks once per request, and one instance answers all of it.
  it 'memoizes per instance, so a repeat ask costs nothing' do
    @user.log_token(destination: DESTINATION)

    User::LogToken.expects(:token_for).never

    @user.log_token(destination: DESTINATION)
  end

  it 'memoizes a nil without asking again' do
    User::LogToken.expects(:token_for).once.returns(nil)

    assert_nil @user.log_token(destination: DESTINATION)
    assert_nil @user.log_token(destination: DESTINATION)
  end

  it 'exposes the user rows through the association' do
    @user.log_token(destination: DESTINATION)

    assert_equal [DESTINATION], @user.log_tokens.reload.map(&:destination)
  end
end
