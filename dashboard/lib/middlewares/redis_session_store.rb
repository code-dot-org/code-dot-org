module Middlewares
  class RedisSessionStore < ActionDispatch::Session::RedisStore
    # Extends +ActionDispatch::Request::Session+ to allow identifying whether a session has been changed.
    module SessionExtension
      def changed?
        @changed.present?
      end

      # @see https://github.com/rails/rails/blob/v6.1.7.7/actionpack/lib/action_dispatch/request/session.rb#L229-L231
      private def load_for_write!
        @changed = true
        super
      end
    end

    def initialize(...)
      ActionDispatch::Request::Session.prepend(SessionExtension)
      super
    end

    # Overrides +Rack::Session::Abstract::Persisted#commit_session?+ to skip committing
    # unchanged sessions for AJAX requests to reduce Redis traffic.
    #
    # @see https://github.com/rack/rack/blob/v2.2.9/lib/rack/session/abstract/id.rb#L342
    private def commit_session?(req, session, options)
      result = super

      # If the session has not changed but still requires committing,
      # it's likely due to the presence of options like +:max_age+ and +:expire_after+,
      # which are intended to prolong the session.
      # In this case, we can skip committing for AJAX requests to reduce Redis traffic.
      # See: https://github.com/rack/rack/blob/v2.2.9/lib/rack/session/abstract/id.rb#L355-L357
      result = !req.xhr? if result && !session.changed? && forced_session_update?(session, options)

      result
    end
  end
end
