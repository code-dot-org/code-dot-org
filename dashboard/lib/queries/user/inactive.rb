module Queries
  module User
    class Inactive
      class << self
        delegate :call, to: :new
      end

      def initialize(scope: User.all, inactive_since: 42.months.ago)
        @scope = scope
        @inactive_since = inactive_since
      end

      def call
        @scope.where(current_sign_in_at: ..@inactive_since)
      end
    end
  end
end