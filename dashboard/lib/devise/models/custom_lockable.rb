module Devise
  module Models
    module CustomLockable
      include Devise::Models::Lockable
      # Only track failed attempts for teachers
      def increment_failed_attempts
        return unless user_type == User::TYPE_TEACHER
        super
      end
    end
  end
end
