module User::ValidatesEmail
  extend ActiveSupport::Concern
  included do
    validates :email, no_utf8mb4: true
    validates_email_format_of :email, allow_blank: true, if: :email_changed?, unless: -> {email.to_s.utf8mb4?}
    validate :presence_of_email, if: :teacher_email_required?
    validate :presence_of_email_or_hashed_email, if: :email_or_hashed_email_required?, on: :create
    validate :email_and_hashed_email_must_be_unique, if: -> {email_changed? || hashed_email_changed?}
    validate :presence_of_hashed_email_or_parent_email, if: :requires_email?
  end

  def requires_email?
    provider_changed? && provider.nil? && encrypted_password_changed? && encrypted_password.present?
  end

  def presence_of_hashed_email_or_parent_email
    if hashed_email.blank? && parent_email.blank?
      errors.add :email, I18n.t('activerecord.errors.messages.blank')
    end
  end

  def presence_of_email
    if email.blank?
      errors.add :email, I18n.t('activerecord.errors.messages.blank')
    end
  end

  def presence_of_email_or_hashed_email
    if email.blank? && hashed_email.blank?
      errors.add :email, I18n.t('activerecord.errors.messages.blank')
    end
  end

  def email_and_hashed_email_must_be_unique
    # skip the db lookup if we are already invalid
    return if errors.present?

    # allow duplicate accounts to be created for LMS users that are unlinked -- new user is lti
    return if Policies::Lti.only_lti_auth?(self)
    if ((email.present? && (other_user = User.find_by_email_or_hashed_email(email))) ||
      (hashed_email.present? && (other_user = User.find_by_hashed_email(hashed_email)))) &&
        other_user != self
      # allow duplicate accounts to be created for LMS users that are unlinked
      return if Policies::Lti.only_lti_auth?(other_user)

      errors.add :email, I18n.t('errors.messages.taken')
    end
  end
end
