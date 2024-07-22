module Devise
  module Models
    module CustomLockable
      # @override https://github.com/heartcombo/devise/blob/v4.9.3/lib/devise/models/lockable.rb#L122-L125
      def increment_failed_attempts
        # Temporarily gate all of this logic behind a DCDO flag, to make it
        # easier to disable this new feature in case we discover either
        # technical or user experience issues upon first release. Defaults to
        # 'enabled' for more consist behavior between environments.
        # TODO infra: remove this once we're convinced the feature is stable.
        return if DCDO.get('devise-custom-lockable-disabled', false)

        # Only track failed attempts for teachers; we can't send 'unlock your
        # account' emails to students, so we don't want to lock them out in the
        # first place.
        return unless user_type == User::TYPE_TEACHER

        # The original implementation uses
        # ActiveRecord::CounterCache#increment_counter, which is intended to
        # make it easier to update frequently-referenced aggregate values in
        # SQL; because we store the count of failed attempts in a properties
        # blob rather than raw SQL, and because this value would not benefit
        # from the optimization even if it were in SQL, we instead simply issue
        # an `update`.
        updated_failed_attempts = (failed_attempts || 0) + 1
        update!(failed_attempts: updated_failed_attempts)
        reload
      end

      # Add support for `nil` values
      # @override https://github.com/heartcombo/devise/blob/v4.9.3/lib/devise/models/lockable.rb#L143-L145
      protected def attempts_exceeded?
        (failed_attempts || 0) >= self.class.maximum_attempts
      end
    end
  end
end
