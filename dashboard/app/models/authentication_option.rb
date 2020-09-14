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
#
# Indexes
#
#  index_auth_on_cred_type_and_auth_id                          (credential_type,authentication_id,deleted_at) UNIQUE
#  index_authentication_options_on_email_and_deleted_at         (email,deleted_at)
#  index_authentication_options_on_hashed_email_and_deleted_at  (hashed_email,deleted_at)
#  index_authentication_options_on_user_id_and_deleted_at       (user_id,deleted_at)
#

class AuthenticationOption < ApplicationRecord
  acts_as_paranoid
  belongs_to :user

  # These are duplicated from the user model, until we're ready to cut over and remove them from there
  before_validation :normalize_email, :hash_email,
    :remove_student_cleartext_email, :fill_authentication_id

  validates :email, no_utf8mb4: true
  validates_email_format_of :email, allow_blank: true, if: :email_changed?, unless: -> {email.to_s.utf8mb4?}

  validate :email_must_be_unique, :hashed_email_must_be_unique, unless: -> {UNTRUSTED_EMAIL_CREDENTIAL_TYPES.include? credential_type}

  validates :authentication_id, uniqueness: {scope: [:credential_type, :deleted_at]}

  after_create :set_primary_contact_info

  # Powerschool note: the Powerschool plugin lives at https://github.com/code-dot-org/powerschool
  OAUTH_CREDENTIAL_TYPES = [
    CLEVER = 'clever',
    FACEBOOK = 'facebook',
    GOOGLE = 'google_oauth2',
    POWERSCHOOL = 'powerschool',
    QWIKLABS = 'lti_lti_prod_kids.qwikcamps.com',
    THE_SCHOOL_PROJECT = 'the_school_project',
    TWITTER = 'twitter',
    WINDOWS_LIVE = 'windowslive',
    MICROSOFT = 'microsoft_v2_auth',
  ].freeze

  CREDENTIAL_TYPES = [
    EMAIL = 'email',
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
    POWERSCHOOL
  ].freeze

  TRUSTED_EMAIL_CREDENTIAL_TYPES = (
    CREDENTIAL_TYPES - UNTRUSTED_EMAIL_CREDENTIAL_TYPES
  ).freeze

  SILENT_TAKEOVER_CREDENTIAL_TYPES = [
    FACEBOOK,
    GOOGLE,
    # TODO: (madelynkasula) Remove once we are sure users are no longer logging in via windowslive.
    WINDOWS_LIVE,
    MICROSOFT
  ].freeze

  scope :trusted_email, -> {where(credential_type: TRUSTED_EMAIL_CREDENTIAL_TYPES)}

  def google?
    credential_type == GOOGLE
  end

  def codeorg_email?
    Mail::Address.new(email).domain == 'code.org'
  end

  def oauth?
    OAUTH_CREDENTIAL_TYPES.include? credential_type
  end

  def primary?
    user.primary_contact_info == self
  end

  def remove_student_cleartext_email
    self.email = '' if user&.student?
  end

  def fill_authentication_id
    self.authentication_id = hashed_email if EMAIL == credential_type
  end

  def set_primary_contact_info
    user.update(primary_contact_info: self) if user.primary_contact_info.nil?
  end

  def normalize_email
    return unless email.present?
    self.email = email.strip.downcase
  end

  def self.hash_email(email)
    Digest::MD5.hexdigest(email.downcase)
  end

  def hash_email
    return unless email.present?
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
      errors.add :email, I18n.t('errors.messages.taken')
    end
  end

  private def hashed_email_must_be_unique
    # skip the db lookup if possible
    return unless hashed_email_changed? && hashed_email.present? && errors.blank?

    other = User.find_by_hashed_email(hashed_email)
    if other && other != user
      errors.add :email, I18n.t('errors.messages.taken')
    end
  end
end
