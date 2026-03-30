# frozen_string_literal: true

module Observability
  module Sentry
    module UserContext
      extend ActiveSupport::Concern

      included do
        before_action :set_user_context
      end

      private def set_user_context
        ::Sentry.set_user(id: current_user.id.to_s) if current_user
      end
    end
  end
end
