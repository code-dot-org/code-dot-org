# frozen_string_literal: true

require 'base64'
require 'json'
require 'openssl'

module Cdo
  # Derives a stable, opaque pseudonym ("log token") for a user id, so that log
  # and telemetry records can be correlated per-user without raw user ids
  # reaching the logs themselves.
  #
  # Unlike a hash, this is reversible by someone holding the key -- see #resolve,
  # which is deliberately awkward to call and always writes an audit record.
  #
  # == Per-destination tokens
  #
  # Every destination gets its own context string, and no two destinations ever
  # share one. The same user produces a completely different token in Sentry than
  # in the AI gateway, so a token obtained from one vendor's data cannot be
  # matched against another's. This is the same reasoning behind OIDC pairwise
  # subject identifiers.
  #
  # The cost is that cross-system correlation starting from an unknown token
  # requires a #resolve, which is audited. Correlation starting from a *known*
  # user is unaffected: derive that user's token for each destination and search
  # for each.
  #
  # == Construction
  #
  # AES-256-GCM. The IV is derived deterministically by HMAC of the plaintext
  # under a subkey separate from the encryption key, which is what makes the same
  # user produce the same token. Both subkeys are HKDF-derived from the
  # configured key, so the raw key is never used directly as a cipher key.
  #
  # The plaintext is padded to a fixed width. Without that, GCM's ciphertext
  # length would equal the plaintext length and the token length would reveal how
  # many digits the user id has -- which, given sequential ids, is a proxy for
  # account age.
  #
  # Determinism is required for correlation and necessarily leaks equality:
  # anyone can see two records share a user, which is the point. It also makes
  # frequency analysis possible in principle.
  #
  # == Keys and rotation
  #
  # CDO.user_log_token_keys holds a JSON object of version => key, each 32+
  # random bytes, base64:
  #
  #   {"1": "<base64>", "2": "<base64>"}
  #
  # The highest version encrypts. Every version is retained for decryption, and a
  # key must be kept at least as long as the longest retention window of any
  # destination carrying its tokens -- unlike a hash, a key we no longer hold
  # means data we can never read. Tokens carry their version as a "v<n>." prefix
  # so #resolve knows which key to use.
  #
  # Generate a key with:
  #
  #   ruby -rsecurerandom -rbase64 -e 'puts Base64.strict_encode64(SecureRandom.bytes(32))'
  #
  module UserLogToken
    class UnknownDestinationError < StandardError; end

    # The rule for splitting destinations: separate them when a token appearing
    # in one system's data would otherwise let it be joined against another's by
    # a party who should not be able to make that link. Systems that are already
    # correlatable by other means -- a shared trace id, a common request path,
    # or simply being held by the same vendor -- may share one.
    #
    # Adding a destination: append a constant here, never reuse or rename an
    # existing string. Renaming one silently invalidates every token already
    # written for it. Names must fit DESTINATION_WIDTH.
    DESTINATIONS = [
      # Our vendor-hosted observability stack: both Sentry projects (dashboard
      # and AI gateway) and Cloudflare AI Gateway metadata.
      #
      # These share one token deliberately. The two Sentry projects are held by
      # one vendor, so splitting them protects against nothing Sentry could do.
      # Cloudflare and the gateway's Sentry project are two views of the same
      # request, already linkable by trace id. Sharing keeps a single user's
      # records findable across the whole stack with one lookup.
      #
      # The accepted cost: a party holding data from both Sentry and Cloudflare
      # could join them on this token.
      OBSERVABILITY = 'observability',
    ].freeze

    CIPHER = 'aes-256-gcm'
    IV_BYTES = 12
    TAG_BYTES = 16
    MIN_KEY_BYTES = 32

    # Fixed-width plaintext, so every token is the same length regardless of
    # destination or user id. users.id is a signed int, so ten digits is the
    # maximum.
    DESTINATION_WIDTH = 20
    ID_WIDTH = 10
    PLAINTEXT_WIDTH = DESTINATION_WIDTH + ID_WIDTH
    PLAINTEXT_FORMAT = "%-#{DESTINATION_WIDTH}s%0#{ID_WIDTH}d"

    raise 'destination names must fit DESTINATION_WIDTH' if DESTINATIONS.any? {|d| d.length > DESTINATION_WIDTH}

    class << self
      # The token to log for this user id at this destination, or nil if no key
      # is configured or the id is absent or out of range.
      #
      # Never raises on a missing key. This sits on a per-request hot path, so a
      # misconfiguration must cost a debugging dimension rather than the site,
      # and there is deliberately no raw-id fallback.
      def derive(user_id, destination:)
        validate_destination!(destination)
        id = normalize(user_id)
        return nil unless id

        version = current_version
        return nil unless version

        plaintext = format(PLAINTEXT_FORMAT, destination, id)
        enc_key, iv_key = subkeys(version)
        iv = OpenSSL::HMAC.digest('SHA256', iv_key, plaintext)[0, IV_BYTES]

        cipher = OpenSSL::Cipher.new(CIPHER)
        cipher.encrypt
        cipher.key = enc_key
        cipher.iv = iv
        ciphertext = cipher.update(plaintext) + cipher.final

        encoded = Base64.urlsafe_encode64(iv + ciphertext + cipher.auth_tag, padding: false)
        "v#{version}.#{encoded}"
      end

      # Reverses a token to {user_id:, destination:}, or nil if it cannot be
      # read. This is the governed direction.
      #
      # +actor_id+ and +reason+ are required rather than optional on purpose. The
      # audit record is written here, in the primitive, rather than in the
      # controller -- a controller-level audit is bypassed by anyone with a
      # production console, whereas this cannot be called at all without stating
      # who you are and why. Someone can still lie, but they cannot silently
      # omit.
      #
      # Failed attempts are audited too: a burst of them is a signal worth having.
      def resolve(token, actor_id:, reason:, request_id: nil)
        raise ArgumentError, 'actor_id is required to resolve a user log token' if blank?(actor_id)
        raise ArgumentError, 'reason is required to resolve a user log token' if blank?(reason)

        result = decrypt(token)
        audit(result: result, actor_id: actor_id, reason: reason, request_id: request_id)
        result
      end

      def configured?
        !keys.empty?
      end

      # Clears memoized key material. Tests only.
      def reset!
        @keys = nil
        @subkeys = nil
        @warned = nil
      end

      private def validate_destination!(destination)
        return if DESTINATIONS.include?(destination)

        raise UnknownDestinationError,
          "unknown log token destination #{destination.inspect}; expected one of #{DESTINATIONS.join(', ')}"
      end

      # Ids arrive as Integers from most callers and Strings from the admin form;
      # both must produce the same token. Anything that will not fit the fixed
      # width is rejected rather than silently truncated.
      private def normalize(user_id)
        return nil if user_id.nil?

        string = user_id.to_s.strip
        return nil unless string.match?(/\A\d{1,#{ID_WIDTH}}\z/o)

        value = string.to_i
        value.positive? ? value : nil
      end

      private def blank?(value)
        value.nil? || value.to_s.strip.empty?
      end

      private def decrypt(token)
        version, payload = parse(token)
        return nil unless version && keys.key?(version)

        raw = Base64.urlsafe_decode64(payload)
        return nil unless raw.bytesize == IV_BYTES + PLAINTEXT_WIDTH + TAG_BYTES

        iv = raw[0, IV_BYTES]
        tag = raw[-TAG_BYTES, TAG_BYTES]
        ciphertext = raw[IV_BYTES, PLAINTEXT_WIDTH]

        enc_key, = subkeys(version)
        decipher = OpenSSL::Cipher.new(CIPHER)
        decipher.decrypt
        decipher.key = enc_key
        decipher.iv = iv
        decipher.auth_tag = tag
        plaintext = decipher.update(ciphertext) + decipher.final

        destination = plaintext[0, DESTINATION_WIDTH].rstrip
        id = plaintext[DESTINATION_WIDTH, ID_WIDTH]
        return nil unless DESTINATIONS.include?(destination) && id.match?(/\A\d{#{ID_WIDTH}}\z/o)

        {user_id: id.to_i, destination: destination}
      rescue OpenSSL::Cipher::CipherError, ArgumentError
        # Tampered, truncated, or encrypted under a key we no longer hold.
        nil
      end

      private def parse(token)
        return [nil, nil] unless token.is_a?(String)

        match = token.match(/\Av(\d+)\.([A-Za-z0-9_-]+)\z/)
        match ? [match[1].to_i, match[2]] : [nil, nil]
      end

      # Deliberately records the resolved user id but NOT the token. The audit is
      # readable by more people than the key is, and a log of token => user id
      # pairs would be a lookup table for exactly the thing we are protecting.
      private def audit(result:, actor_id:, reason:, request_id:)
        payload = {
          event: 'resolve_user_log_token',
          namespace: 'admin',
          request_id: request_id,
          authenticated_user_id: actor_id.to_i,
          affected_user_id: result && result[:user_id],
          destination: result && result[:destination],
          outcome: result ? 'resolved' : 'not_resolved',
          reason: reason.to_s.strip,
        }.compact
        CDO.log.warn payload.to_json
      end

      private def subkeys(version)
        @subkeys ||= {}
        @subkeys[version] ||= begin
          key = keys.fetch(version)
          [
            OpenSSL::KDF.hkdf(key, salt: '', info: 'user_log_token/enc', length: 32, hash: 'SHA256'),
            OpenSSL::KDF.hkdf(key, salt: '', info: 'user_log_token/iv', length: 32, hash: 'SHA256'),
          ]
        end
      end

      private def current_version
        keys.keys.max
      end

      private def keys
        @keys ||= parse_keys
      end

      private def parse_keys
        raw = CDO.user_log_token_keys
        return disabled('is not configured') if raw.nil? || (raw.respond_to?(:strip) && raw.strip.empty?)

        # Secrets Manager always hands back a String, but the development and
        # test stubs are read straight from YAML, where an unquoted value parses
        # as a Hash. Accept either rather than raising at boot.
        parsed = raw.is_a?(Hash) ? raw : JSON.parse(raw)
        return disabled('is not a JSON object of version => key') unless parsed.is_a?(Hash)

        usable = parsed.each_with_object({}) do |(version, encoded), acc|
          next unless version.to_s.match?(/\A\d+\z/)
          next unless encoded.is_a?(String) && !encoded.strip.empty?

          # Strict, so a mangled key is skipped rather than silently decoding to
          # unintended bytes and becoming the version we encrypt under.
          decoded = begin
            Base64.strict_decode64(encoded.strip)
          rescue ArgumentError
            next
          end
          next if decoded.bytesize < MIN_KEY_BYTES

          acc[version.to_i] = decoded
        end
        return disabled("contains no usable keys of at least #{MIN_KEY_BYTES} bytes") if usable.empty?

        usable
      rescue StandardError => exception
        # Broad on purpose. CDO.user_log_token_keys is a lazily-resolved !Secret,
        # so first access can raise from Secrets Manager as well as from JSON --
        # and derive must not raise, whatever the cause.
        disabled("could not be read: #{exception.class}: #{exception.message}")
      end

      # Warn once rather than per request, so a misconfiguration is visible
      # without flooding the logs.
      private def disabled(problem)
        unless @warned
          @warned = true
          CDO.log.warn "[user_log_token] CDO.user_log_token_keys #{problem}; user log tokens are disabled"
        end
        {}
      end
    end
  end
end
