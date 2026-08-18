# frozen_string_literal: true

require 'base64'
require 'json'
require 'openssl'

# This concern makes a token from a user id that can be stored in logs.
#
# A person who has the key can change a token back to a user id with
# .resolve_log_token. That method always writes an audit record.
#
# == Method
#
# The concern uses AES-256-GCM. It calculates the IV from the plaintext with
# HMAC. The same user always gets the same token for the same destination.
#
# The concern makes two subkeys from the configured key with HKDF. It does not
# use the configured key directly.
#
# The concern adds spaces to the plaintext to give all tokens the same length.
# Without this, the length of a token shows the number of digits in the user
# id. User ids increase in sequence, so this also shows the age of the account.
#
# == Keys
#
# CDO.user_log_token_keys contains a JSON object of version to key. Each key is
# 32 or more random bytes in base64:
#
#   {"1": "<base64>", "2": "<base64>"}
#
# The concern encrypts with the highest version. It keeps all versions to
# decrypt. Keep a key while its tokens stay in the logs. If you remove a key too
# soon, you cannot read its tokens again.
#
# To make a key:
#
#   ruby -rsecurerandom -rbase64 -e 'puts Base64.strict_encode64(SecureRandom.bytes(32))'
#
module User::LogToken
  extend ActiveSupport::Concern

  # Two destinations make different tokens for the same user to preserve privacy across vendors.
  # To add a destination, add a new constant. Do not rename or use again a name
  # that tokens already contain: the old tokens then become unreadable. A name
  # must not be longer than DESTINATION_WIDTH.
  DESTINATIONS = [
    SENTRY = 'sentry',
  ].freeze

  CIPHER = 'aes-256-gcm'
  IV_BYTES = 12
  TAG_BYTES = 16
  MIN_KEY_BYTES = 32

  # All tokens have the same length. users.id is a signed integer, so a user id
  # has 10 digits or fewer.
  DESTINATION_WIDTH = 20
  ID_WIDTH = 10
  PLAINTEXT_WIDTH = DESTINATION_WIDTH + ID_WIDTH
  PLAINTEXT_FORMAT = "%-#{DESTINATION_WIDTH}s%0#{ID_WIDTH}d"

  raise 'destination names must fit DESTINATION_WIDTH' if DESTINATIONS.any? {|d| d.length > DESTINATION_WIDTH}
  # decrypt removes the added spaces to get the destination. A name with its own
  # spaces would make tokens that never resolve.
  raise 'destination names must not be surrounded by whitespace' if DESTINATIONS.any? {|d| d != d.strip}

  # This user's token for the given destination.
  def log_token(destination:)
    User::LogToken.derive(id, destination: destination)
  end

  class_methods do
    # For callers that hold a user id but no record, such as the admin lookup
    # page, which deliberately does not load the row it is asked about.
    def log_token_for(user_id, destination:)
      User::LogToken.derive(user_id, destination: destination)
    end

    def resolve_log_token(token, actor_id:, reason:, request_id: nil)
      User::LogToken.resolve(token, actor_id: actor_id, reason: reason, request_id: request_id)
    end

    def log_token_configured?
      User::LogToken.configured?
    end
  end

  # The cipher lives on this module rather than in class_methods so that User
  # does not gain private class methods named keys, parse, decrypt and audit.
  class << self
    # Makes the token for this user id at this destination. Returns nil if the
    # destination is unknown, if there is no key, or if the id is empty or too
    # large.
    #
    # This method must not raise an error. Rails calls it for each request. If
    # the key is not correct, we lose the token but the site continues. Do not
    # add a fallback to the user id.
    def derive(user_id, destination:)
      return nil unless known_destination?(destination)

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

    # Changes a token back to {user_id:, destination:}. Returns nil if the
    # concern cannot read the token.
    #
    # You must give +actor_id+ and +reason+ for the audit record.
    #
    # The method also writes a record when it cannot read the token. Many
    # failures together are a signal.
    def resolve(token, actor_id:, reason:, request_id: nil)
      actor = normalize(actor_id)
      raise ArgumentError, 'actor_id must be the user id of whoever is resolving' unless actor
      raise ArgumentError, 'reason is required to resolve a user log token' if blank?(reason)

      result = decrypt(token)
      audit(result: result, actor_id: actor, reason: reason, request_id: request_id)
      result
    end

    def configured?
      !keys.empty?
    end

    # Removes the keys from memory. For tests only.
    def reset!
      @keys = nil
      @subkeys = nil
      @warned = nil
    end

    private def known_destination?(destination)
      return true if DESTINATIONS.include?(destination)

      CDO.log.warn "[user_log_token] unknown destination #{destination.inspect}; " \
        "expected one of #{DESTINATIONS.join(', ')}"
      false
    end

    # Callers give an Integer or a String. Both must make the same token. The
    # method refuses an id that is too large. It does not make the id shorter.
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
      # A person changed the token, or it is too short, or we removed its key.
      nil
    end

    private def parse(token)
      return [nil, nil] unless token.is_a?(String)

      match = token.match(/\Av(\d+)\.([A-Za-z0-9_-]+)\z/)
      match ? [match[1].to_i, match[2]] : [nil, nil]
    end

    private def audit(result:, actor_id:, reason:, request_id:)
      payload = {
        event: 'resolve_user_log_token',
        namespace: 'admin',
        request_id: request_id,
        authenticated_user_id: actor_id,
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

    # A failed read is retried rather than kept. CDO.user_log_token_keys is a
    # lazy !Secret, so the first read can fail for a passing reason, and this
    # process would otherwise mint no tokens until it restarts.
    private def keys
      @keys = parse_keys if @keys.blank?
      @keys
    end

    private def parse_keys
      raw = CDO.user_log_token_keys
      return disabled('is not configured') if raw.nil? || (raw.respond_to?(:strip) && raw.strip.empty?)

      parsed = raw.is_a?(Hash) ? raw : JSON.parse(raw)
      return disabled('is not a JSON object of version => key') unless parsed.is_a?(Hash)

      usable = parsed.each_with_object({}) do |(version, encoded), acc|
        next unless version.to_s.match?(/\A\d+\z/)
        next unless encoded.is_a?(String) && !encoded.strip.empty?

        # Strict, so the concern refuses a damaged key. A lenient decode could
        # give unwanted bytes, and we could then encrypt with them.
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
      # Broad on purpose. CDO.user_log_token_keys is a lazy !Secret. The first
      # read can raise an error from Secrets Manager or from JSON. derive must
      # not raise an error for any cause.
      disabled("could not be read: #{exception.class}: #{exception.message}")
    end

    # Writes the warning one time only. A wrong configuration stays visible,
    # but the logs do not fill.
    private def disabled(problem)
      unless @warned
        @warned = true
        CDO.log.warn "[user_log_token] CDO.user_log_token_keys #{problem}; user log tokens are disabled"
      end
      {}
    end
  end
end
