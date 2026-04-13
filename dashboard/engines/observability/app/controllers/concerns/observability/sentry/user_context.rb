# frozen_string_literal: true

module Observability
  module Sentry
    module UserContext
      extend ActiveSupport::Concern

      included do
        before_action :set_user_context
      end

      private def set_user_context
        user = request.env['warden']&.user(scope: :user, run_callbacks: false)
        ::Sentry.set_user(id: user.id) if user.present?
      end
    end
  end
end
