require 'test_helper'

class UserLogTokenTest < ActiveSupport::TestCase
  DESTINATION = User::LogToken::SENTRY

  KEY_ONE = Base64.strict_encode64(SecureRandom.bytes(32))
  KEY_TWO = Base64.strict_encode64(SecureRandom.bytes(32))

  # An index into a token that lands within the encrypted portion: past the
  # "v1." prefix and the 16 base64 characters holding the IV, well short of the
  # 16-byte tag at the end.
  CIPHERTEXT_CHARACTER = 30

  def load_keys(*encoded_keys)
    keys = encoded_keys.each_with_index.to_h {|key, index| [(index + 1).to_s, key]}
    CDO.stubs(:user_log_token_keys).returns(keys.to_json)
    User::LogToken.reset!
  end

  def load_raw(value)
    CDO.stubs(:user_log_token_keys).returns(value)
    User::LogToken.reset!
  end

  before do
    load_keys(KEY_ONE)
  end

  after do
    User::LogToken.reset!
  end

  # The surface User gains by including the concern. Everything below exercises
  # the same cipher through User::LogToken directly.
  describe 'the methods the concern adds to User' do
    it 'derives a token for a user from its id' do
      user = User.new(id: 12345)

      assert_equal User::LogToken.derive(12345, destination: DESTINATION),
        user.log_token(destination: DESTINATION)
    end

    # The admin lookup page holds an id but deliberately does not load the row.
    it 'derives a token from a bare user id' do
      assert_equal User::LogToken.derive(12345, destination: DESTINATION),
        User.log_token_for(12345, destination: DESTINATION)
    end

    it 'resolves a token back to its user id' do
      token = User.log_token_for(12345, destination: DESTINATION)

      assert_equal 12345, User.resolve_log_token(token, actor_id: 1, reason: 'test')[:user_id]
    end

    it 'reports whether a key is configured' do
      assert User.log_token_configured?

      load_raw(nil)

      refute User.log_token_configured?
    end
  end

  describe 'derive' do
    it 'is deterministic for the same user and destination' do
      assert_equal User::LogToken.derive(12345, destination: DESTINATION),
        User::LogToken.derive(12345, destination: DESTINATION)
    end

    it 'derives the same token from an Integer and a String user id' do
      assert_equal User::LogToken.derive(12345, destination: DESTINATION),
        User::LogToken.derive('12345', destination: DESTINATION)
    end

    it 'derives different tokens for different user ids' do
      refute_equal User::LogToken.derive(12345, destination: DESTINATION),
        User::LogToken.derive(12346, destination: DESTINATION)
    end

    it 'does not leak the user id into the token' do
      refute_includes User::LogToken.derive(12345, destination: DESTINATION), '12345'
    end

    it 'prefixes the token with the key version' do
      assert User::LogToken.derive(12345, destination: DESTINATION).start_with?('v1.')
    end

    it 'returns nil for an unknown destination' do
      assert_nil User::LogToken.derive(12345, destination: 'not_a_destination')
    end

    it 'returns nil for a nil user id' do
      assert_nil User::LogToken.derive(nil, destination: DESTINATION)
    end

    it 'returns nil for a blank user id' do
      assert_nil User::LogToken.derive('   ', destination: DESTINATION)
    end
  end

  # There is only one destination today, so separation cannot be asserted
  # directly. What can be asserted is the mechanism it depends on: the
  # destination is bound into the encrypted payload rather than sitting
  # alongside it, which is what makes two destinations produce unrelated tokens
  # once a second one exists. Add a separation test at that point.
  describe 'destination binding' do
    it 'binds the destination into the token, recoverable only by decrypting' do
      token = User::LogToken.derive(12345, destination: DESTINATION)

      refute_includes token, DESTINATION
      assert_equal DESTINATION,
        User::LogToken.resolve(token, actor_id: 1, reason: 'test')[:destination]
    end
  end

  describe 'resolve' do
    it 'round-trips a token back to its user id' do
      token = User::LogToken.derive(12345, destination: DESTINATION)

      assert_equal 12345, User::LogToken.resolve(token, actor_id: 1, reason: 'test')[:user_id]
    end

    it 'reports which destination the token was minted for' do
      token = User::LogToken.derive(12345, destination: DESTINATION)

      assert_equal DESTINATION, User::LogToken.resolve(token, actor_id: 1, reason: 'test')[:destination]
    end

    # Required rather than optional so that the audit cannot be skipped by
    # calling this from a console instead of the admin page.
    it 'refuses to resolve without an actor' do
      token = User::LogToken.derive(12345, destination: DESTINATION)

      assert_raises(ArgumentError) {User::LogToken.resolve(token, actor_id: '', reason: 'test')}
    end

    # Otherwise the actor coerces to 0 and the audit names nobody, which is the
    # silent omission the required keyword exists to prevent.
    it 'refuses to resolve for an actor that is not a user id' do
      token = User::LogToken.derive(12345, destination: DESTINATION)

      assert_raises(ArgumentError) do
        User::LogToken.resolve(token, actor_id: 'admin@code.org', reason: 'test')
      end
    end

    it 'refuses to resolve without a reason' do
      token = User::LogToken.derive(12345, destination: DESTINATION)

      assert_raises(ArgumentError) {User::LogToken.resolve(token, actor_id: 1, reason: '  ')}
    end

    it 'returns nil for a malformed token rather than raising' do
      assert_nil User::LogToken.resolve('nonsense', actor_id: 1, reason: 'test')
    end

    it 'returns nil for a well-formed but undecryptable token' do
      assert_nil User::LogToken.resolve('v1.aaaabbbbccccdddd', actor_id: 1, reason: 'test')
    end

    # Authenticated encryption: a modified token must fail, never decrypt to
    # some other valid user. The flipped character has to land inside the
    # ciphertext -- the token's last character carries base64 padding bits, and
    # a change to those is caught by the decoder before the cipher is consulted,
    # which would leave the cipher untested a quarter of the time.
    it 'rejects a tampered token' do
      token = User::LogToken.derive(12345, destination: DESTINATION)
      tampered = token.dup
      tampered[CIPHERTEXT_CHARACTER] = tampered[CIPHERTEXT_CHARACTER] == 'A' ? 'B' : 'A'

      assert_nil User::LogToken.resolve(tampered, actor_id: 1, reason: 'test')
    end
  end

  describe 'audit' do
    it 'records the actor, the affected user, and the reason' do
      token = User::LogToken.derive(12345, destination: DESTINATION)
      CDO.log.expects(:warn).with do |payload|
        entry = JSON.parse(payload)
        entry['event'] == 'resolve_user_log_token' &&
          entry['namespace'] == 'admin' &&
          entry['authenticated_user_id'] == 42 &&
          entry['affected_user_id'] == 12345 &&
          entry['destination'] == DESTINATION &&
          entry['outcome'] == 'resolved' &&
          entry['reason'] == 'zendesk 4821'
      end

      User::LogToken.resolve(token, actor_id: 42, reason: 'zendesk 4821')
    end

    # The audit is readable by more people than the key is. A record pairing a
    # token with a user id would be a lookup table for the thing we are
    # protecting.
    it 'does not record the token itself' do
      token = User::LogToken.derive(12345, destination: DESTINATION)
      CDO.log.expects(:warn).with {|payload| payload.exclude?(token)}

      User::LogToken.resolve(token, actor_id: 42, reason: 'zendesk 4821')
    end

    it 'records failed attempts, since a burst of them is a signal' do
      CDO.log.expects(:warn).with do |payload|
        entry = JSON.parse(payload)
        entry['outcome'] == 'not_resolved' && entry['authenticated_user_id'] == 42
      end

      User::LogToken.resolve('v1.undecryptable', actor_id: 42, reason: 'fishing')
    end
  end

  describe 'key rotation' do
    it 'writes new tokens under the highest key version' do
      load_keys(KEY_ONE, KEY_TWO)

      assert User::LogToken.derive(12345, destination: DESTINATION).start_with?('v2.')
    end

    it 'changes every token when a new key is introduced' do
      before_rotation = User::LogToken.derive(12345, destination: DESTINATION)
      load_keys(KEY_ONE, KEY_TWO)

      refute_equal before_rotation, User::LogToken.derive(12345, destination: DESTINATION)
    end

    # The reason superseded keys have to be retained: tokens already written to
    # a log are only readable while their key is still configured.
    it 'still resolves tokens written under a superseded key' do
      before_rotation = User::LogToken.derive(12345, destination: DESTINATION)
      load_keys(KEY_ONE, KEY_TWO)

      assert_equal 12345,
        User::LogToken.resolve(before_rotation, actor_id: 1, reason: 'test')[:user_id]
    end

    it 'cannot resolve a token whose key has been dropped' do
      before_rotation = User::LogToken.derive(12345, destination: DESTINATION)
      load_keys(KEY_TWO)

      assert_nil User::LogToken.resolve(before_rotation, actor_id: 1, reason: 'test')
    end
  end

  # Cdo::Secrets parses a secret whose value is a JSON object, so every
  # environment holding a real key hands this concern a Hash rather than the
  # String the rest of these tests stub. Both shapes have to work.
  describe 'key configuration already parsed into a Hash' do
    before {load_raw({'1' => KEY_ONE})}

    it 'reports itself as configured' do
      assert User::LogToken.configured?
    end

    it 'derives tokens that resolve back to their user id' do
      token = User::LogToken.derive(12345, destination: DESTINATION)

      assert_equal 12345, User::LogToken.resolve(token, actor_id: 1, reason: 'test')[:user_id]
    end
  end

  # A missing or malformed key must degrade to no token rather than raising,
  # because derive sits on a per-request hot path.
  describe 'when the key configuration is unusable' do
    [
      ['not configured', nil],
      ['blank', '   '],
      ['not valid JSON', '{oh no'],
      ['not a JSON object', '["a key"]'],
      ['an object with no numeric versions', '{"current": "a key"}'],
      ['holding a key shorter than 32 bytes', '{"1": "c2hvcnQ="}'],
    ].each do |description, value|
      describe "because it is #{description}" do
        before {load_raw(value)}

        it 'reports itself as unconfigured' do
          refute User::LogToken.configured?
        end

        it 'returns nil from derive without raising' do
          assert_nil User::LogToken.derive(12345, destination: DESTINATION)
        end
      end
    end

    it 'picks the key up on a later call once it can be read' do
      load_raw(nil)
      assert_nil User::LogToken.derive(12345, destination: DESTINATION)

      CDO.stubs(:user_log_token_keys).returns({'1' => KEY_ONE}.to_json)

      refute_nil User::LogToken.derive(12345, destination: DESTINATION)
    end
  end
end
