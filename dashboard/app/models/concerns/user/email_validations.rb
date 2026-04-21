module User::EmailValidations
  extend ActiveSupport::Concern

  # FND-1130: This field will no longer be required
  DATE_TEACHER_EMAIL_REQUIREMENT_ADDED = '2016-06-14 00:00:00'.to_datetime

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

  # Determines if email is a required field for a teacher.
  # Currently, we have some old teacher accounts which don't have an email
  # address associated with them because it wasn't required when they were
  # created. Those old accounts are allowed to skip the email validation.
  def teacher_email_required?
    return false if Policies::Lti.lti? self
    # non-teachers are not relevant to this method.
    return false unless teacher? && purged_at.nil? && pii_scrubbed_at.nil?

    # new teacher accounts should always require an email
    return true if created_at.blank?

    # existing accounts created after the email requirement must have an email.
    # FND-1130: The created_at exception will no longer be required
    # Remove the created_at > '2016-06-14 00:00:00' once all teachers have
    # emails.
    return created_at.to_datetime > DATE_TEACHER_EMAIL_REQUIREMENT_ADDED
  end

  def email_or_hashed_email_required?
    return false if Policies::Lti.lti? self
    return true if teacher?
    return false if manual?
    return false if sponsored?
    return false if oauth?
    return false if parent_managed_account?
    true
  end
end
