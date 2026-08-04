require 'jwt'
require 'digest'

# Verifies detached response attestations minted by the AI gateway worker.
#
# WHY THIS EXISTS
#
# Chat history (aichat_events) is written entirely from values the browser posts
# to AichatEventsController#log_chat_event, which stores the event verbatim. On
# the gateway path we never see the model response ourselves: the browser calls
# the worker directly and reports back. So a modified client can invent what the
# model "said" and we record it as history a teacher later reads as evidence.
#
# The worker signs a detached attestation over a digest of the response, and we
# verify it here with the worker's public key. The browser stays an untrusted
# courier: it can drop or corrupt the attestation, but cannot forge one without
# the worker's private key. This is the return leg of the arrangement already
# running outbound, where AiGatewayAuthController signs a JWT the browser
# relays to the worker.
#
# WHY A DIGEST AND NOT THE MESSAGE
#
# The attestation carries digests and binding claims only. The response travels
# in the clear, unchanged, so it stays independently verifiable: we recompute
# the digest from what the browser submitted and compare. Nothing about how the
# message is transmitted changes.
#
# WHY VERIFY AT INSERT TIME
#
# Deliberately checked where the event is written rather than earlier, when the
# client reports the response to AichatRequestsController#update. Verifying at
# insert keeps the check self-contained -- signature over the text, binding
# claims over the context -- so nothing has to be remembered between two
# requests and no digest needs storing. It also means a client that lies about
# which AichatRequest an event belongs to gains nothing, since the attestation
# covers the text and context directly.
#
# WHY BINDING MATTERS AS MUCH AS THE SIGNATURE
#
# A signature over a bare digest is a bearer token: replayable into another
# level, another project, or repeatedly. The worker copies user and context from
# the inbound token it already verified -- never from the request body -- and we
# require those to match the context the event is being filed under. `jti` is
# then burned so an attestation is consumable once.
module AichatResponseAttestation
  ALGORITHM = 'RS256'.freeze

  # Must outlive the attestation itself, covering decode leeway plus skew
  # between three clocks: the worker's (which sets exp), ours (which checks it),
  # and the cache's (which expires the nonce). Erring long is free -- the
  # attestation's own exp still rejects it -- while erring short reopens replay
  # in the band where the attestation verifies but its nonce has already gone.
  LEEWAY_SECONDS = 30
  SKEW_MARGIN_SECONDS = 90
  ATTESTATION_LIFETIME_SECONDS = 600
  NONCE_TTL_SECONDS = ATTESTATION_LIFETIME_SECONDS + LEEWAY_SECONDS + SKEW_MARGIN_SECONDS

  # Namespaced per consumer, following LtiV1Controller's use of the same store.
  # Scoping by consumer means burning an attestation for chat history does not
  # preclude a different consumer from using the same attestation for its own
  # purpose.
  NONCE_NAMESPACE = 'aichat_attestation/history'.freeze

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
    # Verifies +attestation+ covers +response_text+ and was minted for +user+ in
    # +context+, then burns its nonce.
    #
    # +context+ takes the aichatContext keys as the client sends them
    # (currentLevelId, scriptId, lessonId, channelId).
    #
    # Returns a Result whose status is one of:
    #   :verified         signature, digest, binding and single-use all hold
    #   :absent           no attestation supplied (worker predating signing, or
    #                     a client that simply omitted it)
    #   :key_unavailable  no usable public key -- our misprovisioning
    #   :invalid          supplied but bad: signature, digest, binding, expiry
    #   :replayed         valid, but its nonce was already consumed
    def verify(attestation:, response_text:, user:, context:)
      return Result.new(status: :absent) if attestation.blank?

      key = public_key
      return Result.new(status: :key_unavailable, error: 'no public key configured') if key.nil?

      claims = decode(attestation, key)

      digest_error = verify_digest(claims, response_text)
      return Result.new(status: :invalid, claims: claims, error: digest_error) if digest_error

      binding_error = verify_binding(claims, user, context)
      return Result.new(status: :invalid, claims: claims, error: binding_error) if binding_error

      # Burned last: only after everything else holds, so a rejected attestation
      # does not consume its own nonce and lock out a legitimate retry.
      unless burn_nonce(claims['jti'])
        return Result.new(status: :replayed, claims: claims, error: 'attestation already used')
      end

      Result.new(status: :verified, claims: claims)
    rescue JWT::DecodeError => exception
      # Signature mismatch, malformed token and expiry all land here. To us they
      # mean the same thing: the attestation supplied is not usable.
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

    # Records +jti+ as consumed. Returns false if it was already present.
    #
    # `unless_exist` maps to memcached's atomic `add`, which matters
    # independently of eviction: a plain read-then-write would let two
    # simultaneous submissions both observe "unused" and both proceed.
    #
    # Note the store is explicitly not durable (see Cdo::SharedCache) -- an
    # eviction before the TTL forgets a burned nonce and lets that attestation
    # be used again. Accepted deliberately: the binding claims pin user, level,
    # script and channel, and the digest is fixed, so a replay can only
    # re-insert the same genuine response into the same user's history inside
    # the window. Duplication, not forgery.
    private def burn_nonce(jti)
      return false if jti.blank?
      CDO.shared_cache.write(
        "#{NONCE_NAMESPACE}/#{jti}",
        Time.now.utc.iso8601,
        expires_in: NONCE_TTL_SECONDS,
        unless_exist: true
      )
    rescue StandardError => exception
      # A cache outage must not become an integrity failure for legitimate
      # traffic. Fail open on replay protection only -- signature, digest and
      # binding have already been checked and are unaffected.
      Rails.logger.warn(
        "AichatResponseAttestation: nonce store unavailable (#{exception.class}: #{exception.message})"
      )
      true
    end

    private def decode(attestation, key)
      claims, = JWT.decode(
        attestation,
        key,
        true,
        algorithm: ALGORITHM,
        verify_expiration: true,
        verify_iat: true,
        leeway: LEEWAY_SECONDS,
        required_claims: %w[response_sha256 jti exp user_id token_id]
      )
      claims
    end

    private def verify_digest(claims, response_text)
      # secure_compare because the expected value is attacker-visible and there
      # is nothing to gain by leaking where a mismatch occurred.
      expected = claims['response_sha256'].to_s
      actual = sha256(response_text)
      return nil if ActiveSupport::SecurityUtils.secure_compare(expected, actual)
      'response digest does not match attestation'
    end

    # The attestation must have been minted for this user and this context, or a
    # valid one could be filed against a different level, script or project.
    private def verify_binding(claims, user, context)
      unless claims['user_id'].to_s == user.id.to_s
        return 'attestation user_id does not match current user'
      end
      {
        'level_id' => context[:currentLevelId],
        'script_id' => context[:scriptId],
        'lesson_id' => context[:lessonId],
      }.each do |claim, actual|
        unless nilable_int(claims[claim]) == nilable_int(actual)
          return "attestation #{claim} does not match event context"
        end
      end
      # Compared as the opaque channel string the worker was told about, not as
      # a decoded project id: both sides have the same value, so there is no
      # need to translate and no chance of a translation mismatch.
      unless claims['channel_id'].to_s == context[:channelId].to_s
        return 'attestation channel_id does not match event context'
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
        "AichatResponseAttestation: public key unavailable (#{exception.class}: #{exception.message})"
      )
      nil
    end
  end
end
