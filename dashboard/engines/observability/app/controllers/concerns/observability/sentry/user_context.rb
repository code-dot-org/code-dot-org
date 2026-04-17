# frozen_string_literal: true

module Observability
  module Sentry
    module UserContext
      extend ActiveSupport::Concern

      included do
        before_action :set_user_context
      end

      private def set_user_context
        return if skip_sentry_user_context?

        ::Sentry.set_user(id: current_user.id)
      end

      # If the user isn't logged in, we skip trying to log the user context to Sentry.
      # Also skip for Devise session controller actions, since calling current_user in those methods
      # can cause unintended side effects with the Rails session and CSRF tokens.
      private def skip_sentry_user_context?
        return true if controller_name == 'sessions' && %w[new create destroy reset].include?(action_name)

        unauthenticated_request?
      end

      # This method intentionally checks using the Warden authenticated? method rather than relying
      # on the Devise current_user helper, which calls warden.authenticate under certain circumstances.
      private def unauthenticated_request?
        request.env['warden']&.authenticated?(:user) != true
      end
    end
  end
end
