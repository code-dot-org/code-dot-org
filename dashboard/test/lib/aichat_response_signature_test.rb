require 'test_helper'

class AichatResponseSignatureTest < ActiveSupport::TestCase
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

  DEFAULT_PROMPT = 'what is 2 + 2?'.freeze

  # Digest claims for a turn. Pass prompt_sha256 in overrides to sign a different
  # student message than the default.
  def claims_for(response_text, overrides = {})
    now = Time.now.to_i
    {
      'response_sha256' => Digest::SHA256.hexdigest(response_text),
      'prompt_sha256' => Digest::SHA256.hexdigest(DEFAULT_PROMPT),
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

  def verify(signature, text, user: nil, context: nil, pem: :default, covers: :response)
    key = pem == :default ? @public_pem : pem
    AichatResponseSignature.with_public_key(key) do
      AichatResponseSignature.verify(
        signature: signature,
        text: text,
        user: user || @user,
        context: context || @context,
        covers: covers
      )
    end
  end

  test 'verifies a well-formed signature' do
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
    assert_match(/does not match response_sha256/, result.error)
  end

  test 'rejects a signature from the wrong key' do
    text = 'hello'
    other_key = OpenSSL::PKey::RSA.new(2048)

    result = verify(JWT.encode(claims_for(text), other_key, 'RS256'), text)
    assert_equal :invalid, result.status
  end

  test 'rejects an expired signature' do
    text = 'hello'
    stale = claims_for(text, 'iat' => Time.now.to_i - 7200, 'exp' => Time.now.to_i - 3600)

    assert_equal :invalid, verify(sign(stale), text).status
  end

  test 'rejects an unsigned (alg=none) token' do
    text = 'hello'
    assert_equal :invalid, verify(JWT.encode(claims_for(text), nil, 'none'), text).status
  end

  test 'reports absent rather than invalid when no signature is supplied' do
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

  test 'rejects a signature minted for another user' do
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

  test 'rejects a signature missing required claims' do
    text = 'hello'
    incomplete = claims_for(text)
    incomplete.delete('jti')

    assert_equal :invalid, verify(sign(incomplete), text).status
  end

  test 'a signature cannot be reused for the same half of the turn' do
    text = 'hello'
    signature = sign(claims_for(text))

    assert_equal :verified, verify(signature, text, covers: :response).status
    replay = verify(signature, text, covers: :response)
    assert_equal :replayed, replay.status
    refute replay.verified?
    assert_match(/already used for response/, replay.error)
  end

  test 'does not spend a use when verification fails' do
    # The nonce is consumed last, so a rejected attempt must not lock out a
    # legitimate retry carrying the same signature.
    signature = sign(claims_for('the real response'))

    assert_equal :invalid, verify(signature, 'a forged response').status
    assert_equal :verified, verify(signature, 'the real response').status
  end

  test 'rejects an unknown covers value rather than opening a fresh keyspace' do
    # A typo would otherwise verify happily while giving that caller no replay
    # protection at all.
    text = 'hello'
    signature = sign(claims_for(text))

    assert_raises(ArgumentError) {verify(signature, text, covers: :typo)}
  end

  test 'nonces are namespaced per consumer and per half of the turn' do
    # Namespaced so another consumer of the same store cannot collide with us,
    # then scoped by half so the turn's two rows cannot collide either.
    assert_equal 'aichat_response_signature', AichatResponseSignature::NONCE_NAMESPACE
    assert_equal(
      {prompt: 'prompt_sha256', response: 'response_sha256'},
      AichatResponseSignature::DIGEST_CLAIMS
    )
  end

  test 'nonce TTL outlives the signature plus leeway and skew' do
    # Equal lifetimes would leave a band where the signature still verifies
    # but its nonce has already expired, reopening replay.
    assert_operator(
      AichatResponseSignature::NONCE_TTL_SECONDS,
      :>,
      AichatResponseSignature::SIGNATURE_LIFETIME_SECONDS +
        AichatResponseSignature::LEEWAY_SECONDS
    )
  end

  test 'sha256 matches the digest the worker computes' do
    assert_equal(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      AichatResponseSignature.sha256('')
    )
  end

  test 'checks the student message against the prompt digest' do
    prompt = 'how do I center a div?'
    signature = sign(claims_for('use flexbox', {'prompt_sha256' => Digest::SHA256.hexdigest(prompt)}))

    result = verify(signature, prompt, covers: :prompt)

    assert result.verified?
  end

  test 'rejects a student message that is not what the model was asked' do
    # The other half of the same guarantee: a client cannot ask the model one
    # thing and record another.
    signature = sign(claims_for('use flexbox', {'prompt_sha256' => Digest::SHA256.hexdigest('how do I center a div?')}))

    result = verify(signature, 'how do I hack the grader?', covers: :prompt)

    refute result.verified?
    assert_equal :invalid, result.status
    assert_match(/prompt_sha256/, result.error)
  end

  test 'does not accept the response text as the student message' do
    # Each half is pinned to its own claim, so the two are not interchangeable.
    response = 'use flexbox'
    signature = sign(claims_for(response, {'prompt_sha256' => Digest::SHA256.hexdigest('how do I center a div?')}))

    assert_equal :invalid, verify(signature, response, covers: :prompt).status
  end

  test 'does not accept the student message as the response' do
    prompt = 'how do I center a div?'
    signature = sign(claims_for('use flexbox', {'prompt_sha256' => Digest::SHA256.hexdigest(prompt)}))

    assert_equal :invalid, verify(signature, prompt, covers: :response).status
  end

  test 'one signature covers both halves of a turn, spent once each' do
    prompt = 'how do I center a div?'
    response = 'use flexbox'
    signature = sign(claims_for(response, {'prompt_sha256' => Digest::SHA256.hexdigest(prompt)}))

    assert_equal :verified, verify(signature, prompt, covers: :prompt).status
    assert_equal :verified, verify(signature, response, covers: :response).status
    assert_equal :replayed, verify(signature, prompt, covers: :prompt).status
    assert_equal :replayed, verify(signature, response, covers: :response).status
  end

  test 'a worker that signs only the response cannot pass a prompt check' do
    # An older worker omits prompt_sha256. A missing claim must fail rather than
    # compare equal to anything.
    claims = claims_for('use flexbox', prompt: 'how do I center a div?')
    claims.delete('prompt_sha256')

    result = verify(sign(claims), 'how do I center a div?', covers: :prompt)

    refute result.verified?
    assert_equal :invalid, result.status
  end
end
