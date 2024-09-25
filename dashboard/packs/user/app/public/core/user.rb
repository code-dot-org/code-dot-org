class Core::User
  def self.upgrade_to_teacher(user, email, email_preference = nil)
    return true if user.teacher? # No-op if user is already a teacher
    return false if email.blank?

    # Remove family name, in case it was set on the student account.
    # Must do this before updating user_type, to prevent validation failure.
    user.family_name = nil

    hashed_email = User.hash_email(email)
    user.user_type = User::TYPE_TEACHER
    # teachers do not need another adult to have access to their account.
    user.parent_email = nil

    new_attributes = email_preference.nil? ? {} : email_preference
    if Policies::Lti.lti? user
      user.lti_roster_sync_enabled = true
    end

    ActiveRecord::Base.transaction do
      if user.migrated?
        user.update_primary_contact_info!(new_email: email, new_hashed_email: hashed_email)
      else
        new_attributes[:email] = email
      end
      user.update!(new_attributes)

      user
    end
  rescue
    false # Relevant errors are set on the user model, so we rescue and return false here.
  end
end
