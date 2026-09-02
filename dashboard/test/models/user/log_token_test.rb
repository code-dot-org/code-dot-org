require 'test_helper'

class UserLogTokenTest < ActiveSupport::TestCase
  DESTINATION = User::LogToken::SENTRY

  setup do
    @user = create(:student)
    CDO.shared_cache.clear
  end

  teardown do
    CDO.shared_cache.clear
  end

  describe 'token_for' do
    it 'mints a uuid for a user that has none' do
      token = User::LogToken.token_for(@user.id, destination: DESTINATION)

      assert_match(/\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/, token)
    end

    it 'stores one row for the user, destination and period' do
      User::LogToken.token_for(@user.id, destination: DESTINATION)

      record = User::LogToken.find_by(user_id: @user.id, destination: DESTINATION)
      assert_equal User::LogToken.current_period, record.period
    end

    it 'is stable for the same user, destination and period' do
      first = User::LogToken.token_for(@user.id, destination: DESTINATION)
      CDO.shared_cache.clear

      assert_equal first, User::LogToken.token_for(@user.id, destination: DESTINATION)
    end

    it 'does not mint a second row on a later call' do
      User::LogToken.token_for(@user.id, destination: DESTINATION)
      CDO.shared_cache.clear

      assert_no_difference 'User::LogToken.count' do
        User::LogToken.token_for(@user.id, destination: DESTINATION)
      end
    end

    it 'derives the same token from an Integer and a String user id' do
      assert_equal User::LogToken.token_for(@user.id, destination: DESTINATION),
        User::LogToken.token_for(@user.id.to_s, destination: DESTINATION)
    end

    it 'gives different users different tokens' do
      other = create(:student)

      refute_equal User::LogToken.token_for(@user.id, destination: DESTINATION),
        User::LogToken.token_for(other.id, destination: DESTINATION)
    end

    it 'does not leak the user id into the token' do
      refute_includes User::LogToken.token_for(@user.id, destination: DESTINATION), @user.id.to_s
    end

    it 'returns nil for an unknown destination' do
      assert_nil User::LogToken.token_for(@user.id, destination: 'not_a_destination')
    end

    it 'returns nil for a nil user id' do
      assert_nil User::LogToken.token_for(nil, destination: DESTINATION)
    end

    it 'returns nil for a blank user id' do
      assert_nil User::LogToken.token_for('   ', destination: DESTINATION)
    end

    # A database problem must cost the token, not the request.
    it 'returns nil rather than raising when the table cannot be read' do
      User::LogToken.stubs(:mint).raises(ActiveRecord::StatementInvalid, 'table is gone')

      assert_nil User::LogToken.token_for(@user.id, destination: DESTINATION)
    end

    # The loser of a concurrent mint must read the winner's row, not add a second.
    it 'returns the existing token when its own insert loses a race' do
      existing = User::LogToken.create!(
        user_id: @user.id,
        destination: DESTINATION,
        period: User::LogToken.current_period,
        uuid: SecureRandom.uuid,
      )
      User::LogToken.stubs(:find_or_create_by!).raises(ActiveRecord::RecordNotUnique, 'duplicate')

      assert_equal existing.uuid, User::LogToken.token_for(@user.id, destination: DESTINATION)
    end
  end

  describe 'rotation' do
    it 'mints a new token when the period changes' do
      this_year = User::LogToken.token_for(@user.id, destination: DESTINATION)

      next_period = User::LogToken.current_period + 1
      User::LogToken.stubs(:current_period).returns(next_period)
      next_year = User::LogToken.token_for(@user.id, destination: DESTINATION)

      refute_equal this_year, next_year
    end

    # Tokens already written to a log only resolve while their row is still here.
    it 'still resolves a token from a superseded period' do
      before_rotation = User::LogToken.token_for(@user.id, destination: DESTINATION)
      next_period = User::LogToken.current_period + 1
      User::LogToken.stubs(:current_period).returns(next_period)

      assert_equal @user.id,
        User::LogToken.resolve(before_rotation, actor_id: 1, reason: 'test')[:user_id]
    end

    it 'cannot resolve a token whose row has been dropped' do
      token = User::LogToken.token_for(@user.id, destination: DESTINATION)
      User::LogToken.find_by(uuid: token).destroy!

      assert_nil User::LogToken.resolve(token, actor_id: 1, reason: 'test')
    end
  end

  describe 'resolve' do
    it 'round-trips a token back to its user id' do
      token = User::LogToken.token_for(@user.id, destination: DESTINATION)

      assert_equal @user.id, User::LogToken.resolve(token, actor_id: 1, reason: 'test')[:user_id]
    end

    it 'reports which destination and period the token was minted for' do
      token = User::LogToken.token_for(@user.id, destination: DESTINATION)
      result = User::LogToken.resolve(token, actor_id: 1, reason: 'test')

      assert_equal DESTINATION, result[:destination]
      assert_equal User::LogToken.current_period, result[:period]
    end

    # So the audit cannot be skipped by calling this from a console.
    it 'refuses to resolve without an actor' do
      token = User::LogToken.token_for(@user.id, destination: DESTINATION)

      assert_raises(ArgumentError) {User::LogToken.resolve(token, actor_id: '', reason: 'test')}
    end

    # Otherwise the actor coerces to 0 and the audit names nobody.
    it 'refuses to resolve for an actor that is not a user id' do
      token = User::LogToken.token_for(@user.id, destination: DESTINATION)

      assert_raises(ArgumentError) do
        User::LogToken.resolve(token, actor_id: 'admin@code.org', reason: 'test')
      end
    end

    it 'refuses to resolve without a reason' do
      token = User::LogToken.token_for(@user.id, destination: DESTINATION)

      assert_raises(ArgumentError) {User::LogToken.resolve(token, actor_id: 1, reason: '  ')}
    end

    it 'returns nil for a token no row holds' do
      assert_nil User::LogToken.resolve(SecureRandom.uuid, actor_id: 1, reason: 'test')
    end

    it 'returns nil for a malformed token rather than raising' do
      assert_nil User::LogToken.resolve('nonsense', actor_id: 1, reason: 'test')
    end
  end

  describe 'audit' do
    it 'records the actor, the affected user, and the reason' do
      token = User::LogToken.token_for(@user.id, destination: DESTINATION)
      CDO.log.expects(:warn).with do |payload|
        entry = JSON.parse(payload)
        entry['event'] == 'resolve_user_log_token' &&
          entry['namespace'] == 'admin' &&
          entry['authenticated_user_id'] == 42 &&
          entry['affected_user_id'] == @user.id &&
          entry['destination'] == DESTINATION &&
          entry['period'] == User::LogToken.current_period &&
          entry['outcome'] == 'resolved' &&
          entry['reason'] == 'zendesk 4821'
      end

      User::LogToken.resolve(token, actor_id: 42, reason: 'zendesk 4821')
    end

    # A token => user id record would copy what this table guards.
    it 'does not record the token itself' do
      token = User::LogToken.token_for(@user.id, destination: DESTINATION)
      CDO.log.expects(:warn).with {|payload| payload.exclude?(token)}

      User::LogToken.resolve(token, actor_id: 42, reason: 'zendesk 4821')
    end

    it 'records failed attempts, since a burst of them is a signal' do
      CDO.log.expects(:warn).with do |payload|
        entry = JSON.parse(payload)
        entry['outcome'] == 'not_resolved' && entry['authenticated_user_id'] == 42
      end

      User::LogToken.resolve(SecureRandom.uuid, actor_id: 42, reason: 'fishing')
    end
  end

  describe 'caching' do
    # The shared cache is a FileStore in test, which persists across examples,
    # so these install a MemoryStore to keep them independent.
    before do
      @null_cache = CDO.shared_cache
      CDO.stubs(:shared_cache).returns(ActiveSupport::Cache::MemoryStore.new)
    end

    after {CDO.unstub(:shared_cache)}

    it 'answers a repeat call without touching the table' do
      User::LogToken.token_for(@user.id, destination: DESTINATION)
      User::LogToken.expects(:mint).never

      User::LogToken.token_for(@user.id, destination: DESTINATION)
    end

    it 'does not cache a nil, so a transient failure is retried' do
      User::LogToken.stubs(:mint).returns(nil).then.returns('a-real-uuid')

      assert_nil User::LogToken.token_for(@user.id, destination: DESTINATION)
      assert_equal 'a-real-uuid', User::LogToken.token_for(@user.id, destination: DESTINATION)
    end
  end

  describe 'cache invalidation' do
    before do
      CDO.stubs(:shared_cache).returns(ActiveSupport::Cache::MemoryStore.new)
    end

    after {CDO.unstub(:shared_cache)}

    # Purging a user destroys the row through the association; the token has to
    # stop being emitted then, not when the entry expires.
    it 'stops serving a token once its row is destroyed' do
      token = User::LogToken.token_for(@user.id, destination: DESTINATION)
      User::LogToken.find_by(uuid: token).destroy!

      refute_equal token, User::LogToken.token_for(@user.id, destination: DESTINATION)
    end
  end

  describe 'the user association' do
    it 'goes away with the user' do
      User::LogToken.token_for(@user.id, destination: DESTINATION)

      assert_difference 'User::LogToken.count', -1 do
        @user.destroy!
      end
    end
  end
end
