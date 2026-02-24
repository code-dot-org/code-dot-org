module Devise
  module Models
    # Extend Devise's built-in Lockable functionality for compatibility with
    # our particular implementation needs. In particular, we scope it to apply
    # only to teachers, add SerializedProperties support, and log some metrics.
    #
    # See https://www.rubydoc.info/github/plataformatec/devise/Devise/Models/Lockable
    module CustomLockable
      # @override https://github.com/heartcombo/devise/blob/v4.9.3/lib/devise/models/lockable.rb#L122-L125
      def increment_failed_attempts
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

      # Record lock and unlock events. Make sure to only log method invocations
      # that will actually result in a state change, to avoid logging no-op
      # invocations such as from the password reset workflow.
      #
      # As a core system event related to the user model, we want to log these
      # in CloudWatch in order to preserve metrics for the long term. And as a
      # newly-enabled feature, we want to also log them in Statsig to make the
      # metric available on the product team's dashboards in the short term.

      # @override https://github.com/heartcombo/devise/blob/v4.9.3/lib/devise/models/lockable.rb#L42-L50
      def lock_access!
        unless access_locked?
          # CloudWatch
          Cdo::Metrics.put(
            'User', 'DeviseLockableAccessLocked', 1, {
              Environment: CDO.rack_env,
              UserType: user_type
            }
          )

          # Statsig
          Metrics::Events.log_event(
            user: current_user,
            event_name: 'devise-lockable-user-access-locked',
          )
        end

        super
      end

      # @override https://github.com/heartcombo/devise/blob/v4.9.3/lib/devise/models/lockable.rb#L53-L58
      def unlock_access!
        if access_locked?
          # CloudWatch
          Cdo::Metrics.put(
            'User', 'DeviseLockableAccessUnlocked', 1, {
              Environment: CDO.rack_env,
              UserType: user_type
            }
          )

          # Statsig
          Metrics::Events.log_event(
            user: current_user,
            event_name: 'devise-lockable-user-access-unlocked',
          )
        end

        super
      end

      # Add support for `nil` values; this is necessary because we store the
      # count of failed attempts in a properties blob rather than a database
      # column, so it defaults to `nil` rather than `0`.
      # @override https://github.com/heartcombo/devise/blob/v4.9.3/lib/devise/models/lockable.rb#L143-L145
      protected def attempts_exceeded?
        (failed_attempts || 0) >= self.class.maximum_attempts
      end
    end
  end
end
