class Policies::User
  ALLOWED_EDUCATOR_ROLES = SharedConstants::EDUCATOR_ROLES.pluck(:value)

  # Authentication option types which we always consider to be "owned" by the school
  # the student attends because the school has admin control of the account.
  SCHOOL_OWNED_TYPES = Set[AuthenticationOption::CLEVER, AuthenticationOption::LTI_V1].freeze

  # Login types that are always considered personal logins.
  PERSONAL_LOGIN_TYPES = Set[AuthenticationOption::EMAIL, AuthenticationOption::FACEBOOK].freeze

  # Returns the user.attributes along with the attributes of select
  # associations.
  def self.user_attributes(user)
    attributes = user.attributes
    authentication_options = user.authentication_options.map {|ao| ao.attributes.compact}

    # Remove the plaintext email from the session cache
    attributes.delete("email")

    attributes.merge('authentication_options_attributes' => authentication_options).compact
  end

  # Determines if a user passes some of the criteria to be a verified teacher.
  # In order to be a verified teacher candidate, the user must:
  # - Successfully sync a Google Classroom
  # - Have a google_oauth2 Authentication Option
  # - Have a non-google/non-gmail email domain attached to that googele_oauth2 authentication option
  def self.verified_teacher_candidate?(user)
    return false if user.verified_teacher?
    google_ao = user.authentication_options.find_by(credential_type: AuthenticationOption::GOOGLE)
    return false unless google_ao

    is_google_email = google_ao.email.end_with?('@gmail.com', '@googlemail.com', '@google.com')
    !is_google_email
  end

  def self.in_usa?(country_code)
    %w[US RD].include?(country_code)
  end

  # Does the user login using credentials they personally control?
  # For example, some accounts are created and owned by schools (Clever).
  # @param user [User] the user to check
  # @return [Boolean] true if the user has a personal (non-school-managed) account
  def self.personal_account?(user)
    # Sponsored accounts are always managed by the teacher.
    return false if user.sponsored?

    # Any account is considered school owned for users who are in sections and/or
    # if the user was created via a roster sync.
    return false if conditionally_school_managed?(user)

    # Email + password logins are personal logins.
    return true if user.encrypted_password.present?

    providers = user.migrated? ? Set.new(user.authentication_options.pluck(:credential_type)) : Set.new([user.provider])
    return true if providers.empty?

    # Email and Facebook are personal logins.
    return true if providers.intersect?(PERSONAL_LOGIN_TYPES)

    # Clever and LTI are never personal logins if no other login types are present.
    return false if providers.subset?(SCHOOL_OWNED_TYPES)

    return true
  end

  # Checks if the user's account is conditionally managed by a school.
  # This includes users who are in sections or were created via roster sync.
  # @param user [User] the user to check
  # @return [Boolean] true if the user's account is school-managed
  def self.conditionally_school_managed?(user)
    !!(user.sections_as_student.exists? || user.roster_synced)
  end
end
