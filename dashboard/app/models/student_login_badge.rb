require 'base64'
require 'digest'
require 'securerandom'
require 'policies/student_badges'

class StudentLoginBadge < ApplicationRecord
  class KeyUnavailable < StandardError; end
  class Conflict < StandardError; end

  PAYLOAD_PATTERN = /\ACDO1\.([0-9a-f]{32})\.([1-9][0-9]{0,8})\.([A-Za-z0-9_-]{43})\z/
  MAX_PAYLOAD_LENGTH = 128
  REQUEST_ID_PATTERN = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/

  belongs_to :user

  data_classification(
    secret_digest: :highly_restricted,
    encrypted_secret: :highly_restricted,
  )

  def self.on_primary(&block)
    ActiveRecord::Base.connected_to(role: :writing, &block)
  end

  def self.parse(payload)
    return unless payload.is_a?(String) && payload.bytesize <= MAX_PAYLOAD_LENGTH && payload.ascii_only?
    PAYLOAD_PATTERN.match(payload)
  end

  def self.authenticate(payload)
    return unless Policies::StudentBadges.authentication_enabled?
    parts = parse(payload)
    return unless parts

    on_primary do
      badge = find_by(public_id: parts[1], generation: parts[2].to_i)
      return unless badge&.usable?
      return unless ActiveSupport::SecurityUtils.secure_compare(badge.secret_digest, Digest::SHA256.hexdigest(parts[3]))
      badge
    end
  end

  def self.change!(student:, actor:, operation:, request_id:, expected_generation:, section: nil)
    raise ArgumentError unless %w[issue replace renew revoke].include?(operation)
    raise ArgumentError unless request_id.is_a?(String) && REQUEST_ID_PATTERN.match?(request_id)
    raise ArgumentError unless /\A[0-9]{1,9}\z/.match?(expected_generation.to_s)
    expected_generation = expected_generation.to_i

    on_primary do
      transaction do
        student = User.lock.find(student.id)
        badge = find_by(user_id: student.id)
        prior = StudentLoginBadgeEvent.find_by(user_id: student.id, request_id: request_id)
        if prior
          raise Conflict unless prior.actor_id == actor.id && prior.operation == operation && prior.generation == badge&.generation
          next badge
        end
        raise Conflict unless (badge&.generation || 0) == expected_generation

        if operation == 'revoke'
          raise Conflict unless badge
          badge.update!(revoked_at: Time.current, encrypted_secret: nil)
        else
          raise Conflict if operation == 'issue' && badge
          raise Conflict if operation != 'issue' && !badge
          badge ||= new(user: student, public_id: SecureRandom.hex(16), generation: 0, issuer_id: actor.id, section_id: section.id)
          badge.issue_secret!
        end
        badge.audit!(operation, actor.id, request_id: request_id)
        badge
      end
    end
  end

  def usable?
    revoked_at.nil? && expires_at > Time.current && Policies::StudentBadges.account_eligible?(user)
  end

  def payload
    raise Conflict unless usable?
    secret = encryptor.decrypt_and_verify(encrypted_secret, purpose: encryption_purpose)
    raise KeyUnavailable unless secret.is_a?(String) && /\A[A-Za-z0-9_-]{43}\z/.match?(secret)
    "CDO1.#{public_id}.#{generation}.#{secret}"
  rescue ActiveSupport::MessageEncryptor::InvalidMessage
    raise KeyUnavailable, cause: nil
  end

  def issue_secret!
    secret = SecureRandom.urlsafe_base64(32, false)
    self.generation += 1
    self.key_version = CDO.student_badge_encryption_key_version
    self.secret_digest = Digest::SHA256.hexdigest(secret)
    self.encrypted_secret = encryptor.encrypt_and_sign(secret, purpose: encryption_purpose)
    self.issued_at = Time.current
    self.expires_at = issued_at + Policies::StudentBadges::LIFETIME
    self.revoked_at = nil
    save!
  end

  def rotate_encryption_key!
    with_lock do
      return if encrypted_secret.nil?
      secret = encryptor.decrypt_and_verify(encrypted_secret, purpose: encryption_purpose)
      raise KeyUnavailable unless secret
      self.key_version = CDO.student_badge_encryption_key_version
      self.encrypted_secret = encryptor.encrypt_and_sign(secret, purpose: encryption_purpose)
      save!
    end
  rescue ActiveSupport::MessageEncryptor::InvalidMessage
    raise KeyUnavailable, cause: nil
  end

  def audit!(operation, actor_id, request_id: nil)
    StudentLoginBadgeEvent.create!(user_id: user_id, actor_id: actor_id, operation: operation, generation: generation, request_id: request_id)
  end

  def status
    {generation: generation, expires_at: expires_at, revoked: revoked_at.present?, expired: expires_at <= Time.current,
     expires_soon: expires_at <= Time.current + Policies::StudentBadges::EXPIRATION_WARNING}
  end

  private def encryption_purpose
    "student-login-badge:#{user_id}:#{public_id}:#{generation}"
  end

  private def encryptor
    configured = CDO.student_badge_encryption_keys
    keys = configured.is_a?(Hash) ? configured.stringify_keys : JSON.parse(configured.presence || '{}')
    key = Base64.strict_decode64(keys.fetch(key_version))
    raise KeyUnavailable unless key.bytesize == 32
    ActiveSupport::MessageEncryptor.new(key, cipher: 'aes-256-gcm', serializer: JSON)
  rescue JSON::ParserError, KeyError, ArgumentError, TypeError
    raise KeyUnavailable, cause: nil
  end
end
