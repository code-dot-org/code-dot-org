module Services
  module User
    class UpgradeToTeacher < Services::Base
      attr_reader :user, :email
      attr_accessor :new_attributes

      def initialize(user:, email:, email_preference: nil)
        @user = user
        @email = email
        @new_attributes = email_preference || {}
      end

      def call
        return true if user.teacher? # No-op if user is already a teacher
        return false if email.blank?

        user.user_type = ::User::TYPE_TEACHER
        user.parent_email = nil # teachers do not need another adult to have access to their account.

        hashed_email = ::User.hash_email(email)

        user.lti_roster_sync_enabled = true if ::Policies::Lti.lti?(user)

        user.transaction do
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
  end
end
