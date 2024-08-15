class Policies::User
  # Returns the user.attributes along with the attributes of select
  # associations.
  def self.user_attributes(user)
    attributes = user.attributes
    authentication_options = user.authentication_options.map {|ao| ao.attributes.compact}

    # Remove the plaintext email from the session cache
    attributes.delete("email") if DCDO.get('student-email-post-enabled', false)

    attributes.merge('authentication_options_attributes' => authentication_options).compact
  end

  # Determines if a user passes some of the criteria to be a verified teacher.
  # In order to be a verified teacher candidate, the user must:
  # - Successfully sync a Google Classroom
  # - Have a google_oauth2 Authentication Option
  # - Have a non-google/non-gmail email domain attached to that googele_oauth2 authentication option
  def self.verified_teacher_candidate?(user)
    google_ao = user.authentication_options.find_by(credential_type: AuthenticationOption::GOOGLE)
    return false unless google_ao

    is_google_email = google_ao.email.end_with?('@gmail.com', '@googlemail.com')
    !is_google_email
  end
end
