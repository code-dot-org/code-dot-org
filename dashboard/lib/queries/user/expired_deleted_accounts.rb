module Queries
  module User
    # Retrieve all users who have been soft-deleted for at least the specified duration. Defaults to 28 days,
    # which is the current grace period before rendering accounts unrecoverable during the PII purge process.
    # Does not include accounts that have already been scrubbed of PII or purged/anonymized. These accounts are
    # "hard-deleted" from a functional perspective, and are present only for analytics and reporting purposes.
    class ExpiredDeletedAccounts < Queries::Base
      def initialize(deleted_before: ::User::SOFT_DELETED_RECORD_TTL.ago)
        @deleted_before = deleted_before
        validate_deleted_before
      end

      def call
        ::User.only_deleted.
          where(deleted_at: ..@deleted_before).
          where(purged_at: nil).
          left_outer_joins(:user_data_retention_status).
          where(user_data_retention_statuses: {pii_scrubbed_at: nil, anonymized_at: nil})
      end

      private def validate_deleted_before
        return if @deleted_before.is_a?(Time) || @deleted_before.is_a?(Date)

        raise ArgumentError, "deleted_before must be a Date or Time type, got #{@deleted_before.class}"
      end
    end
  end
end
