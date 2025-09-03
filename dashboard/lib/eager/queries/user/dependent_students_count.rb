module Queries
  module User
    class DependentStudentsCount < Queries::Base
      def initialize(scope: ::User.all, user_id: nil)
        @scope = scope
        @user_id = user_id
      end

      def call
        user = @scope.find(@user_id)
        user.sections.where.not(login_type: 'email').distinct.joins(:students).select(:'users.id').count
      end
    end
  end
end
