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

  validate :email_must_be_unique, :hashed_email_must_be_unique,
    :cred_type_and_auth_id_must_be_unique

  after_create :set_primary_contact_info

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
  ]

  CREDENTIAL_TYPES = [
    EMAIL = 'email',
    OAUTH_CREDENTIAL_TYPES,
  ].flatten

  SILENT_TAKEOVER_CREDENTIAL_TYPES = [
    FACEBOOK,
    GOOGLE,
    WINDOWS_LIVE
  ]

  def oauth?
    OAUTH_CREDENTIAL_TYPES.include? credential_type
  end

  def remove_student_cleartext_email
    self.email = '' if user.student?
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

  private def cred_type_and_auth_id_must_be_unique
    # skip the db lookup if possible
    return unless authentication_id.present? &&
      (credential_type_changed? || authentication_id_changed?) &&
      errors.blank?

    other = User.find_by_credential(type: credential_type, id: authentication_id)
    if other && other != user
      errors.add :credential_type, I18n.t('errors.messages.taken')
    end
  end
end
