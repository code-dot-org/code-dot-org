require 'test_helper'

class AichatResponseAttestationTest < ActiveSupport::TestCase
  # A throwaway keypair per run. Signing here with the private half stands in for
  # the worker; the module only ever sees the public half, exactly as in
  # production where the private key exists only as a wrangler secret.
  setup do
    @key = OpenSSL::PKey::RSA.new(2048)
    @public_pem = @key.public_key.to_pem
    @user = create(:student)
    @context = {
      currentLevelId: 987,
      scriptId: 12,
      lessonId: nil,
      channelId: 'channel-abc',
    }
    # Each test gets a clean nonce store, or a jti burned by one test would make
    # another report :replayed.
    CDO.shared_cache.clear if CDO.shared_cache.respond_to?(:clear)
  end

  def claims_for(response_text, overrides = {})
    now = Time.now.to_i
    {
      'response_sha256' => Digest::SHA256.hexdigest(response_text),
      'model' => 'gemini-2.5-flash',
      'user_id' => @user.id.to_s,
      'level_id' => @context[:currentLevelId],
      'script_id' => @context[:scriptId],
      'lesson_id' => @context[:lessonId],
      'channel_id' => @context[:channelId],
      'token_id' => SecureRandom.uuid,
      'jti' => SecureRandom.uuid,
      'iat' => now,
      'exp' => now + 600,
    }.merge(overrides)
  end

  def sign(claims)
    JWT.encode(claims, @key, 'RS256')
  end

  def verify(attestation, response_text, user: nil, context: nil, pem: :default)
    key = pem == :default ? @public_pem : pem
    AichatResponseAttestation.with_public_key(key) do
      AichatResponseAttestation.verify(
        attestation: attestation,
        response_text: response_text,
        user: user || @user,
        context: context || @context
      )
    end
  end

  test 'verifies a well-formed attestation' do
    text = 'Photosynthesis converts light into chemical energy.'
    result = verify(sign(claims_for(text)), text)

    assert result.verified?
    assert_equal :verified, result.status
  end

  test 'rejects a response that does not match the signed digest' do
    # The point of the whole design: the signature covers a digest, so
    # substituting the message fails even though the signature itself is intact.
    result = verify(sign(claims_for('the real response')), 'a forged response')

    refute result.verified?
    assert_equal :invalid, result.status
    assert_match(/digest does not match/, result.error)
  end

  test 'rejects a signature from the wrong key' do
    text = 'hello'
    other_key = OpenSSL::PKey::RSA.new(2048)

    result = verify(JWT.encode(claims_for(text), other_key, 'RS256'), text)
    assert_equal :invalid, result.status
  end

  test 'rejects an expired attestation' do
    text = 'hello'
    stale = claims_for(text, 'iat' => Time.now.to_i - 7200, 'exp' => Time.now.to_i - 3600)

    assert_equal :invalid, verify(sign(stale), text).status
  end

  test 'rejects an unsigned (alg=none) token' do
    text = 'hello'
    assert_equal :invalid, verify(JWT.encode(claims_for(text), nil, 'none'), text).status
  end

  test 'reports absent rather than invalid when no attestation is supplied' do
    # Must stay distinguishable: :absent is an un-upgraded worker or a legacy
    # event, :invalid is an attack signal. Conflating them buries the latter and
    # would also stop legacy events from falling through to their own check.
    [nil, ''].each do |value|
      result = verify(value, 'hello')
      assert_equal :absent, result.status
      refute result.verified?
    end
  end

  test 'reports key_unavailable when no public key is configured' do
    text = 'hello'
    result = verify(sign(claims_for(text)), text, pem: nil)

    assert_equal :key_unavailable, result.status
    assert result.operational?, 'a missing key is our problem, not an attack'
  end

  test 'rejects an attestation minted for another user' do
    text = 'hello'
    other = create(:student)
    result = verify(sign(claims_for(text, 'user_id' => other.id.to_s)), text)

    assert_equal :invalid, result.status
    assert_match(/user_id/, result.error)
  end

  test 'rejects replay into a different level' do
    text = 'hello'
    result = verify(sign(claims_for(text, 'level_id' => 555)), text)

    assert_equal :invalid, result.status
    assert_match(/level_id/, result.error)
  end

  test 'rejects replay into a different script' do
    text = 'hello'
    result = verify(sign(claims_for(text, 'script_id' => 999)), text)

    assert_equal :invalid, result.status
    assert_match(/script_id/, result.error)
  end

  test 'rejects replay into a different lesson' do
    text = 'hello'
    result = verify(sign(claims_for(text, 'lesson_id' => 42)), text)

    assert_equal :invalid, result.status
    assert_match(/lesson_id/, result.error)
  end

  test 'rejects replay into a different channel' do
    text = 'hello'
    result = verify(sign(claims_for(text, 'channel_id' => 'someone-elses-channel')), text)

    assert_equal :invalid, result.status
    assert_match(/channel_id/, result.error)
  end

  test 'rejects an attestation missing required claims' do
    text = 'hello'
    incomplete = claims_for(text)
    incomplete.delete('jti')

    assert_equal :invalid, verify(sign(incomplete), text).status
  end

  test 'burns the nonce so the same attestation cannot be reused' do
    text = 'hello'
    attestation = sign(claims_for(text))

    assert_equal :verified, verify(attestation, text).status
    replay = verify(attestation, text)
    assert_equal :replayed, replay.status
    refute replay.verified?
  end

  test 'does not burn the nonce when verification fails' do
    # The nonce is consumed last, so a rejected attempt must not lock out a
    # legitimate retry carrying the same attestation.
    claims = claims_for('the real response')
    attestation = sign(claims)

    assert_equal :invalid, verify(attestation, 'a forged response').status
    assert_equal :verified, verify(attestation, 'the real response').status
  end

  test 'nonces are namespaced per consumer' do
    # Burning for chat history must not preclude another consumer of the same
    # attestation from using it for its own purpose.
    assert_match %r{^aichat_attestation/history}, AichatResponseAttestation::NONCE_NAMESPACE
  end

  test 'nonce TTL outlives the attestation plus leeway and skew' do
    # Equal lifetimes would leave a band where the attestation still verifies
    # but its nonce has already expired, reopening replay.
    assert_operator(
      AichatResponseAttestation::NONCE_TTL_SECONDS,
      :>,
      AichatResponseAttestation::ATTESTATION_LIFETIME_SECONDS +
        AichatResponseAttestation::LEEWAY_SECONDS
    )
  end

  test 'sha256 matches the digest the worker computes' do
    assert_equal(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      AichatResponseAttestation.sha256('')
    )
  end
end
