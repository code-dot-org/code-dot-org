module Services
  module User
    module UserType
      class UpgradeToTeacher < Services::Base
        attr_reader :user, :email, :email_preference

        def initialize(user:, email:, email_preference: nil)
          @user = user
          @email = email
          @email_preference = email_preference || {}
        end

        def call
          return true if user.teacher?
          return false if email.blank?

          user.family_name = nil
          user.user_type = ::User::TYPE_TEACHER
          user.parent_email = nil

          hashed_email = ::User.hash_email(email)

          user.lti_roster_sync_enabled = true if ::Policies::Lti.lti?(user)

          user.transaction do
            if user.migrated?
              user.update_primary_contact_info!(new_email: email, new_hashed_email: hashed_email)
            else
              email_preference[:email] = email
            end
            user.update!(email_preference)

            user
          end
        rescue
          false # Relevant errors are set on the user model, so we rescue and return false here.
        end
      end
    end
  end
end
