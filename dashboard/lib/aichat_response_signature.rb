require 'jwt'
require 'digest'

# Verifies detached signatures minted by the AI gateway worker.
#
# WHY THIS EXISTS
#
# Chat history (aichat_events) is written entirely from values the browser posts
# to AichatEventsController#log_chat_event, which stores the event verbatim. On
# the gateway path we see neither half of the turn: the browser calls the worker
# directly, so it both sends the student's message and reports the model's reply.
# A modified client can therefore invent what the model "said" and what it was
# asked, and we record both as history a teacher later reads as evidence.
#
# The worker is the only party that sees both, so it signs a digest of each --
# prompt_sha256 for the student's message as it received it, response_sha256 for
# the reply it produced -- in one detached JWS we verify here with its public
# key. The browser stays an untrusted courier: it can drop or corrupt the
# signature, but cannot forge one without the worker's private key. This is the
# return leg of the arrangement already running outbound, where
# AiGatewayAuthController signs a JWT the browser relays to the worker.
#
# Both directions get the same protection. Neither falls back to comparing
# against something the client also supplied -- that would only prove the client
# told the same story twice.
#
# WHY A DIGEST AND NOT THE MESSAGE
#
# The signature carries digests and binding claims only. The response travels in
# the clear, unchanged, so it stays independently verifiable: we recompute the
# digest from what the browser submitted and compare. Nothing about how the
# message is transmitted changes.
#
# WHY BINDING MATTERS AS MUCH AS THE SIGNATURE
#
# A signature over a bare digest is a bearer token: replayable into another
# level, another project, or repeatedly. The worker copies user and context from
# the inbound token it already verified -- never from the request body -- and we
# require those to match the context the event is being filed under. `jti` then
# makes it single-use.
#
# TWO QUESTIONS, AND WHAT SINGLE-USE MEANS
#
# There are only two things to ask of a turn, so `covers` selects which:
#
#   :prompt    was this what the model was asked?   (prompt_sha256)
#   :response  was this what the model answered?    (response_sha256)
#
# Single use is per question, not per signature. One signature covers a whole
# turn and log_chat_event writes two rows from it -- the student's message and
# the model's reply -- so each needs its own counter or the second write would
# look like a replay of the first.
#
# `consume` is separate because not every caller is writing a row.
# AichatRequestsController#update asks the :response question too, but only to
# decide whether to keep `aichat_requests.response`. That write is idempotent:
# the same verified text over the same column. There is nothing for a replay to
# duplicate, and spending the counter there would leave log_chat_event -- the
# call that actually protects history -- reporting :replayed. So it verifies
# without consuming.
module AichatResponseSignature
  ALGORITHM = 'RS256'.freeze

  # Must outlive the signature itself, covering decode leeway plus skew between
  # three clocks: the worker's (which sets exp), ours (which checks it), and the
  # cache's (which expires the nonce). Erring long is free -- the signature's own
  # exp still rejects it -- while erring short reopens replay in the band where
  # the signature verifies but its nonce has already gone.
  LEEWAY_SECONDS = 30
  SKEW_MARGIN_SECONDS = 90
  SIGNATURE_LIFETIME_SECONDS = 600
  NONCE_TTL_SECONDS = SIGNATURE_LIFETIME_SECONDS + LEEWAY_SECONDS + SKEW_MARGIN_SECONDS

  # Namespaced, following LtiV1Controller's use of the same store, then scoped
  # again by the half of the turn being checked, so each has its own counter.
  NONCE_NAMESPACE = 'aichat_response_signature'.freeze

  # What a signature can be checked against, mapped to the claim holding that
  # digest. Enumerated rather than free-form: a typo would silently open a fresh
  # keyspace, which reads as "verified" while protecting nothing.
  DIGEST_CLAIMS = {
    prompt: 'prompt_sha256',
    response: 'response_sha256',
  }.freeze

  # Distinguishes "we could not verify" from "verification failed". The former
  # is our own operational problem -- unprovisioned secret, worker not yet
  # deployed -- and must not be reported as an attack. The latter is a real
  # integrity failure and deserves its own signal, or it drowns in the noise.
  Result = Struct.new(:status, :claims, :error, keyword_init: true) do
    def verified?
      status == :verified
    end

    # True when the failure is ours rather than the caller's.
    def operational?
      status == :key_unavailable
    end
  end

  class << self
    # Checks that +signature+ covers +text+ and was minted for +user+ in
    # +context+.
    #
    # +covers+ is :prompt or :response, selecting which half of the turn +text+
    # is checked against. +consume+ spends that half's single use, and belongs to
    # whoever writes a row from it.
    #
    # +context+ takes the aichatContext keys as the client sends them
    # (currentLevelId, scriptId, lessonId, channelId).
    #
    # Returns a Result whose status is one of:
    #   :verified         signature, digest, binding and single-use all hold
    #   :absent           no signature supplied (worker predating signing, the
    #                     legacy Rails path, or a client that omitted it)
    #   :key_unavailable  no usable public key -- our misprovisioning
    #   :invalid          supplied but bad: signature, digest, binding, expiry
    #   :replayed         valid, but this half was already spent (consume only)
    def verify(signature:, text:, user:, context:, covers:, consume:)
      digest_claim = DIGEST_CLAIMS[covers]
      unless digest_claim
        raise ArgumentError, "signature cannot cover #{covers.inspect}"
      end
      return Result.new(status: :absent) if signature.blank?

      key = public_key
      return Result.new(status: :key_unavailable, error: 'no public key configured') if key.nil?

      claims = decode(signature, key)

      digest_error = verify_digest(claims, text, digest_claim)
      return Result.new(status: :invalid, claims: claims, error: digest_error) if digest_error

      binding_error = verify_binding(claims, user, context)
      return Result.new(status: :invalid, claims: claims, error: binding_error) if binding_error

      # Burned last: only after everything else holds, so a rejected signature
      # does not consume its own use and lock out a legitimate retry.
      if consume && !burn_nonce(claims['jti'], covers)
        return Result.new(
          status: :replayed,
          claims: claims,
          error: "response signature already used for #{covers}"
        )
      end

      Result.new(status: :verified, claims: claims)
    rescue JWT::DecodeError => exception
      # Signature mismatch, malformed token and expiry all land here. To us they
      # mean the same thing: the signature supplied is not usable.
      Result.new(status: :invalid, error: "#{exception.class}: #{exception.message}")
    end

    def sha256(value)
      Digest::SHA256.hexdigest(value.to_s)
    end

    # Test seam: installs a key without reaching for Secrets Manager.
    def with_public_key(pem)
      previous = defined?(@public_key) ? @public_key : :unset
      @public_key = pem.nil? ? nil : OpenSSL::PKey::RSA.new(pem)
      yield
    ensure
      if previous == :unset
        remove_instance_variable(:@public_key) if defined?(@public_key)
      else
        @public_key = previous
      end
    end

    # Records +jti+ as consumed for +covers+. Returns false if it was already
    # present.
    #
    # `unless_exist` maps to memcached's atomic `add`, which matters
    # independently of eviction: a plain read-then-write would let two
    # simultaneous submissions both observe "unused" and both proceed.
    #
    # Note the store is explicitly not durable (see Cdo::SharedCache) -- an
    # eviction before the TTL forgets a burned nonce and lets that signature be
    # used again. Accepted deliberately: the binding claims pin user, level,
    # script and channel, and the digest is fixed, so a replay can only
    # re-insert the same genuine response into the same user's history inside
    # the window. Duplication, not forgery.
    private def burn_nonce(jti, covers)
      return false if jti.blank?
      CDO.shared_cache.write(
        "#{NONCE_NAMESPACE}/#{covers}/#{jti}",
        Time.now.utc.iso8601,
        expires_in: NONCE_TTL_SECONDS,
        unless_exist: true
      )
    rescue StandardError => exception
      # A cache outage must not become an integrity failure for legitimate
      # traffic. Fail open on replay protection only -- signature, digest and
      # binding have already been checked and are unaffected.
      Rails.logger.warn(
        "AichatResponseSignature: nonce store unavailable (#{exception.class}: #{exception.message})"
      )
      true
    end

    private def decode(signature, key)
      claims, = JWT.decode(
        signature,
        key,
        true,
        algorithm: ALGORITHM,
        verify_expiration: true,
        verify_iat: true,
        leeway: LEEWAY_SECONDS,
      # prompt_sha256 is deliberately absent: it is required only for the
      # purposes that check it, and verify_digest already fails a missing claim.
      required_claims: %w[response_sha256 jti exp user_id token_id]
      )
      claims
    end

    # A claim the worker did not send compares as '' and can never match a real
    # digest, so an old worker that signs only the response cannot pass a
    # prompt check by omission.
    private def verify_digest(claims, text, digest_claim)
      # secure_compare because the expected value is attacker-visible and there
      # is nothing to gain by leaking where a mismatch occurred.
      expected = claims[digest_claim].to_s
      actual = sha256(text)
      return nil if ActiveSupport::SecurityUtils.secure_compare(expected, actual)
      "text does not match #{digest_claim} in signature"
    end

    # The signature must have been minted for this user and this context, or a
    # valid one could be filed against a different level, script or project.
    private def verify_binding(claims, user, context)
      unless claims['user_id'].to_s == user.id.to_s
        return 'signature user_id does not match current user'
      end
      {
        'level_id' => context[:currentLevelId],
        'script_id' => context[:scriptId],
        'lesson_id' => context[:lessonId],
      }.each do |claim, actual|
        unless nilable_int(claims[claim]) == nilable_int(actual)
          return "signature #{claim} does not match event context"
        end
      end
      # Compared as the opaque channel string the worker was told about, not as
      # a decoded project id: both sides have the same value, so there is no
      # need to translate and no chance of a translation mismatch.
      unless claims['channel_id'].to_s == context[:channelId].to_s
        return 'signature channel_id does not match event context'
      end
      nil
    end

    private def nilable_int(value)
      value.presence && value.to_i
    end

    # Memoized per process. Reading CDO.* resolves a lazily-loaded Secrets
    # Manager value, and Cdo::Secrets caches the rejected future on failure, so
    # a key provisioned after the first failed read needs a restart either way.
    # Deliberately not a constant assigned in the module body: that would turn a
    # missing secret into a load-time failure for every caller rather than a
    # handled condition here.
    private def public_key
      return @public_key if defined?(@public_key)
      @public_key = load_public_key
    end

    private def load_public_key
      pem = CDO.ai_gateway_worker_public_key
      return nil if pem.blank?
      OpenSSL::PKey::RSA.new(pem)
    rescue StandardError => exception
      # Missing secret, absent AWS credentials, malformed PEM. None are the
      # client's fault, so surface as key_unavailable rather than invalid.
      Rails.logger.warn(
        "AichatResponseSignature: public key unavailable (#{exception.class}: #{exception.message})"
      )
      nil
    end
  end
end
