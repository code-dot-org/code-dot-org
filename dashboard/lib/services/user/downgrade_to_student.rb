module Services
  module User
    # Downgrades a teacher account to a student. This is a destructive action
    # if the teacher has active sections. The UI hides the option when the teacher
    # instructs a non-demo section, but use caution when running this service manually.
    class DowngradeToStudent < Services::Base
      attr_reader :user

      def initialize(user:)
        @user = user
      end

      def call
        return true if user.student? # No-op if user is already a student

        success = false
        ActiveRecord::Base.transaction do
          destroy_sections
          success = update_user_type
          raise ActiveRecord::Rollback unless success
        end
        success
      end

      private def update_user_type
        user.update(
          user_type: ::User::TYPE_STUDENT,
          given_name: nil,
          family_name: nil,
          educator_role: nil
        )
      end

      private def destroy_sections
        user.sections_owned.find_each(&:destroy!)
        user.section_instructors.find_each(&:destroy!)
      end
    end
  end
end
