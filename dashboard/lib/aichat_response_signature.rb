require 'jwt'
require 'digest'

# Verifies detached signatures minted by the AI gateway worker.
#
# On the gateway path the browser calls the worker directly, so it reports both
# the student's message and the model's reply; dashboard sees neither and cannot
# otherwise tell an invented turn from a real one. The worker sees both and
# signs a digest of each, which is what this module checks. Binding is as
# load-bearing as the signature: without it a signature over a bare digest is a
# bearer token, replayable into another level or project. log_chat_event is the
# only caller.
module AichatResponseSignature
  ALGORITHM = 'RS256'.freeze

  # Erring short reopens replay: a signature outliving its own nonce.
  LEEWAY_SECONDS = 30
  SKEW_MARGIN_SECONDS = 90
  SIGNATURE_LIFETIME_SECONDS = 600
  NONCE_TTL_SECONDS = SIGNATURE_LIFETIME_SECONDS + LEEWAY_SECONDS + SKEW_MARGIN_SECONDS

  # Namespaced like LtiV1Controller, which shares this store.
  NONCE_NAMESPACE = 'aichat_response_signature'.freeze

  # Enumerated, not free-form: a typo would open a fresh nonce keyspace.
  DIGEST_CLAIMS = {
    prompt: 'prompt_sha256',
    response: 'response_sha256',
  }.freeze

  # Separates "could not verify" (ours) from "failed" (an attack signal).
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
    # +covers+ picks which half of the turn +text+ is checked against; that
    # half's single use is spent on success. +context+ takes aichatContext keys
    # as the client sends them.
    #
    #   :verified         signature, digest, binding and single-use all hold
    #   :absent           no signature supplied
    #   :key_unavailable  no usable public key -- our misprovisioning
    #   :invalid          supplied but bad: signature, digest, binding, expiry
    #   :replayed         valid, but this half was already spent
    def verify(signature:, text:, user:, context:, covers:)
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

      # Burned last, so a rejected signature cannot lock out a real retry.
      unless burn_nonce(claims['jti'], covers)
        return Result.new(
          status: :replayed,
          claims: claims,
          error: "response signature already used for #{covers}"
        )
      end

      Result.new(status: :verified, claims: claims)
    rescue JWT::DecodeError => exception
      # Mismatch, malformed and expired all mean the same thing: unusable.
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

    # unless_exist maps to memcached's atomic add; read-then-write would race.
    # Not durable (see Cdo::SharedCache): an eviction inside the TTL permits one
    # duplicate insert of the same genuine message. Accepted -- not forgery.
    private def burn_nonce(jti, covers)
      return false if jti.blank?
      CDO.shared_cache.write(
        "#{NONCE_NAMESPACE}/#{covers}/#{jti}",
        Time.now.utc.iso8601,
        expires_in: NONCE_TTL_SECONDS,
        unless_exist: true
      )
    rescue StandardError => exception
      # Fail open on replay only; signature, digest and binding already passed.
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
      # prompt_sha256 omitted: verify_digest already fails a missing claim.
      required_claims: %w[response_sha256 jti exp user_id token_id]
      )
      claims
    end

    # A claim the worker did not send compares as '' and never matches.
    private def verify_digest(claims, text, digest_claim)
      # secure_compare: the expected value is attacker-visible.
      expected = claims[digest_claim].to_s
      actual = sha256(text)
      return nil if ActiveSupport::SecurityUtils.secure_compare(expected, actual)
      "text does not match #{digest_claim} in signature"
    end

    # Otherwise a valid signature could be filed against another level.
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
      # Compared as the opaque channel string, so no translation can mismatch.
      unless claims['channel_id'].to_s == context[:channelId].to_s
        return 'signature channel_id does not match event context'
      end
      nil
    end

    private def nilable_int(value)
      value.presence && value.to_i
    end

    # Not a constant: a missing secret would become a load-time failure.
    # Cdo::Secrets caches the rejected future, so a late key needs a restart.
    private def public_key
      return @public_key if defined?(@public_key)
      @public_key = load_public_key
    end

    private def load_public_key
      pem = CDO.ai_gateway_worker_public_key
      return nil if pem.blank?
      OpenSSL::PKey::RSA.new(pem)
    rescue StandardError => exception
      # None of these are the client's fault: key_unavailable, not invalid.
      Rails.logger.warn(
        "AichatResponseSignature: public key unavailable (#{exception.class}: #{exception.message})"
      )
      nil
    end
  end
end
