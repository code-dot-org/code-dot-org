# == Schema Information
#
# Table name: authentication_options
#
#  id                :integer          not null, primary key
#  email             :string(255)      default(""), not null
#  hashed_email      :string(255)      default(""), not null
#  credential_type   :string(255)      not null
#  authentication_id :string(255)
#  data              :text(65535)
#  deleted_at        :datetime
#  user_id           :integer          not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  version           :string(64)
#
# Indexes
#
#  index_auth_on_cred_type_and_auth_id                          (credential_type,authentication_id,deleted_at) UNIQUE
#  index_authentication_options_on_email_and_deleted_at         (email,deleted_at)
#  index_authentication_options_on_hashed_email_and_deleted_at  (hashed_email,deleted_at)
#  index_authentication_options_on_user_id_and_deleted_at       (user_id,deleted_at)
#

class AuthenticationOption < ApplicationRecord
  export_to_analytics

  data_classification(
    id: :restricted,
    email: :restricted,
    hashed_email: :restricted,
    credential_type: :restricted,
    authentication_id: :restricted,
    data: :highly_restricted,
    deleted_at: :restricted,
    user_id: :restricted,
    created_at: :restricted,
    updated_at: :restricted,
    version: :restricted,
  )

  acts_as_paranoid
  belongs_to :user, optional: true

  # These are duplicated from the user model, until we're ready to cut over and remove them from there
  before_validation :normalize_email, :hash_email,
    :remove_student_cleartext_email, :fill_authentication_id

  validates :email, no_utf8mb4: true
  validates_email_format_of :email, allow_blank: true, if: :email_changed?, unless: -> {email.to_s.utf8mb4?}

  validate :email_must_be_unique, :hashed_email_must_be_unique, unless: -> {UNTRUSTED_EMAIL_CREDENTIAL_TYPES.include? credential_type}

  validates :authentication_id, uniqueness: {scope: [:credential_type, :deleted_at], case_sensitive: true}
  validates :authentication_id, if: :lti?, format: {with: /\A(\S+\|\S+\|\S+)\z/, message: "For LTI authentication_options, format must be 'issuer|audience|subject'"}

  after_create :set_primary_contact_info

  OAUTH_CREDENTIAL_TYPES = [
    CLEVER = 'clever',
    FACEBOOK = 'facebook',
    GOOGLE = 'google_oauth2',
    QWIKLABS = 'lti_lti_prod_kids.qwikcamps.com',
    TWITTER = 'twitter',
    MICROSOFT = 'microsoft_v2_auth',
    CLASSLINK = 'classlink'
  ].freeze

  CREDENTIAL_TYPES = [
    EMAIL = 'email',
    LTI_V1 = 'lti_v1',
    OAUTH_CREDENTIAL_TYPES,
  ].flatten.freeze

  # "untrusted" emails are a somewhat subtle concept.
  #
  # They specifically refer to emails we receive from a provider that
  #
  # A) Does not themselves enforce uniqueness and/or
  # B) Does not allow the user to change the email they have been assigned.
  #
  # In this case, we cannot ourselves enforce uniqueness because we don't want
  # to punish users who were assigned an email that might not be theirs (and
  # which might conflict with a "trusted" email already in our system). We have
  # to be careful in these cases to not use the email as an identifier for
  # user, and instead to rely exclusively on authentication_id
  UNTRUSTED_EMAIL_CREDENTIAL_TYPES = [
    CLEVER,
    CLASSLINK,
    LTI_V1,
  ].freeze

  TRUSTED_EMAIL_CREDENTIAL_TYPES = (
    CREDENTIAL_TYPES - UNTRUSTED_EMAIL_CREDENTIAL_TYPES
  ).freeze

  SILENT_TAKEOVER_CREDENTIAL_TYPES = [
    FACEBOOK,
    GOOGLE,
    MICROSOFT
  ].freeze

  # Providers whose external ids are case-sensitive strings. Lookups for these
  # types confirm matches byte-for-byte (see User.find_by_credential and
  # find_by_exact_credential below) instead of trusting the authentication_id
  # column's case-insensitive collation.
  CASE_SENSITIVE_CREDENTIAL_TYPES = [
    CLASSLINK,
  ].freeze

  module Clever
    VERSION = {
      v3: 'v3',
    }.freeze
  end

  module Classlink
    VERSION = {
      v2: 'v2',
    }.freeze
  end

  scope :trusted_email, -> {where(credential_type: TRUSTED_EMAIL_CREDENTIAL_TYPES)}

  # The authentication_id column's collation (utf8mb3_unicode_ci) compares
  # case-insensitively, but the external ids stored there are case-sensitive.
  # This finder lets the index locate the candidates, then confirms the match
  # byte-for-byte in Ruby: an id differing from the stored value only in case
  # is no match, not a hit. Candidates are scanned rather than rechecking a
  # single row so that ids differing only by case can coexist and still each
  # resolve to their own record.
  def self.find_by_exact_credential(credential_type:, authentication_id:)
    return nil if authentication_id.blank?

    candidates = where(credential_type: credential_type, authentication_id: authentication_id)
    exact = candidates.detect {|option| option.authentication_id == authentication_id.to_s}
    if exact.nil? && candidates.any?
      Observability::Errors.capture_message(
        'Authentication id matched by collation but not byte-exactly',
        extra: {credential_type: credential_type}
      )
    end
    exact
  end

  def google?
    credential_type == GOOGLE
  end

  def email?
    credential_type == EMAIL
  end

  def codeorg_email?
    Mail::Address.new(email).domain == 'code.org'
  end

  def oauth?
    OAUTH_CREDENTIAL_TYPES.include? credential_type
  end

  def lti?
    credential_type == LTI_V1
  end

  def primary?
    user.primary_contact_info == self
  end

  def remove_student_cleartext_email
    self.email = '' if user&.student?
  end

  def fill_authentication_id
    self.authentication_id = hashed_email if credential_type == EMAIL
  end

  def set_primary_contact_info
    user.update(primary_contact_info: self) if user.primary_contact_info.nil?
  end

  def normalize_email
    return if email.blank?
    self.email = email.strip.downcase
  end

  def self.hash_email(email)
    Digest::MD5.hexdigest(email.downcase)
  end

  def hash_email
    return if email.blank?
    self.hashed_email = AuthenticationOption.hash_email(email)
  end

  def data_hash
    column_value = read_attribute(:data)
    if column_value
      JSON.parse(column_value).symbolize_keys
    else
      {}
    end
  end

  def summarize
    {
      id: id,
      credential_type: credential_type,
      email: email,
      hashed_email: hashed_email
    }
  end

  # Given credentials from OmniAuth::AuthHash or a similarly-formatted hash, updates the OAuth tokens on the AuthenticationOption.
  # Expected formatting:
  # credentials = {
  #   token: 'some-token',
  #   refresh_token: 'some-refresh-token',
  #   expires_at: 123456,
  # }
  def update_oauth_credential_tokens(credentials)
    raise 'AuthenticationOption#update_oauth_credential_tokens can only be called on an OAuth credential type.' unless oauth?

    new_data = data_hash
    new_data[:oauth_refresh_token] = credentials[:refresh_token] if credentials[:refresh_token].present?
    new_data[:oauth_token] = credentials[:token]
    new_data[:oauth_token_expiration] = credentials[:expires_at]

    update(data: new_data.to_json)
  end

  private def email_must_be_unique
    # skip the db lookup if possible
    return unless email_changed? && email.present? && errors.blank?

    other = User.find_by_email_or_hashed_email(email)
    if other && other != user
      return if Policies::Lti.only_lti_auth?(other)
      errors.add :email, I18n.t('errors.messages.taken')
    end
  end

  private def hashed_email_must_be_unique
    # skip the db lookup if possible
    return unless hashed_email_changed? && hashed_email.present? && errors.blank?

    other = User.find_by_hashed_email(hashed_email)
    if other && other != user
      return if Policies::Lti.only_lti_auth?(other)
      errors.add :email, I18n.t('errors.messages.taken')
    end
  end
end
