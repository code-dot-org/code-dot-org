module UserTypes
  extend ActiveSupport::Concern

  included do
    attr_accessor :user_type

    TYPE_STUDENT = SharedConstants::USER_TYPES.STUDENT
    TYPE_TEACHER = SharedConstants::USER_TYPES.TEACHER
  end

  def student?
    :user_type == TYPE_STUDENT
  end

  def teacher?
    :user_type == TYPE_TEACHER
  end

  # def set_user_type(user_type, email = nil, email_preference = nil)
  #   case user_type
  #   when TYPE_TEACHER
  #     upgrade_to_teacher(email, email_preference)
  #   when TYPE_STUDENT
  #     downgrade_to_student
  #   else
  #     false # Unexpected user type
  #   end
  # end

  # def downgrade_to_student
  #   return true if student? # No-op if user is already a student
  #   update(user_type: TYPE_STUDENT)
  # end

  # def upgrade_to_teacher(email, email_preference = nil)
  #   return true if teacher? # No-op if user is already a teacher
  #   return false if email.blank?

  #   # Remove family name, in case it was set on the student account.
  #   # Must do this before updating user_type, to prevent validation failure.
  #   self.family_name = nil

  #   hashed_email = User.hash_email(email)
  #   self.user_type = TYPE_TEACHER
  #   # teachers do not need another adult to have access to their account.
  #   self.parent_email = nil

  #   new_attributes = email_preference.nil? ? {} : email_preference
  #   if Policies::Lti.lti? self
  #     self.lti_roster_sync_enabled = true
  #   end

  #   transaction do
  #     if migrated?
  #       update_primary_contact_info!(new_email: email, new_hashed_email: hashed_email)
  #     else
  #       new_attributes[:email] = email
  #     end
  #     update!(new_attributes)

  #     self
  #   end
  # rescue
  #   false # Relevant errors are set on the user model, so we rescue and return false here.
  # end
end
