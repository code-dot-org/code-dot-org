module Queries
  module User
    # Retrieve all users who have not signed in since the provided date.
    # For users who have never signed in, created_at will be used instead of current_sign_in_at.
    # Defaults to 42 months, which is 3 years plus 6 months to account for our long session TTL.
    class Inactive < Queries::Base
      def initialize(scope: ::User.all, inactive_since: 42.months.ago)
        @scope = scope
        @inactive_since = inactive_since

        validate_inactive_since
      end

      def call
        return @scope.none if @inactive_since.blank?
        return @scope.all if @inactive_since > Time.current

        @scope.where(current_sign_in_at: ..@inactive_since).or(
          @scope.where(current_sign_in_at: nil, created_at: ..@inactive_since)
        )
      end

      private def validate_inactive_since
        return if @inactive_since.nil? || @inactive_since.is_a?(Time) || @inactive_since.is_a?(Date)

        raise ArgumentError, "inactive_since must be a Date or Time type, got #{@inactive_since.class}"
      end
    end
  end
end
