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

    # Overrides +Rack::Session::Redis#delete_session+ to temporarily mark the session as deleted,
    # allowing concurrent requests to identify that the session is being deleted and prevent its restoration.
    #
    # @see https://github.com/redis-store/redis-rack/blob/v3.0.0/lib/rack/session/redis.rb#L54
    # @see http://web.archive.org/web/20201023020301/https://paulbutcher.com/2007/05/01/race-conditions-in-rails-sessions-and-how-to-fix-them/
    def delete_session(req, sid, ...)
      super
    ensure
      write_session(req, sid, {deleted: true}, ex: 60) # marks the session as deleted for 60 seconds
      req.session.delete('deleted') # prevents commiting the "deleted" flag to the renewed session
      # By default, a deleted session should be renewed, which involves generating a new session ID and cookie for it.
      # However, since the deleted session is being overwritten with the "deleted" flag, it will bypass the renewal step.
      # Therefore, we need to manually set the :renew option to force the session to be renewed.
      # See:
      # - https://github.com/rack/rack/blob/v2.2.9/lib/rack/session/abstract/id.rb#L217-L218
      # - https://github.com/rack/rack/blob/v2.2.9/lib/rack/session/abstract/id.rb#L377-L380
      # - https://github.com/redis-store/redis-rack/blob/v3.0.0/lib/rack/session/redis.rb#L60
      req.session.options[:renew] = true
    end

    # Overrides +Rack::Session::Abstract::Persisted#commit_session?+ to skip committing a session
    # that is either unchanged for an AJAX request or has been deleted during a previous concurrent request,
    # preventing the restoration of that session and reducing Redis traffic in general.
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

      if result && options[:renew].blank?
        store_session = load_session(req).second.stringify_keys
        result = false if store_session['deleted']
      end

      result
    end
  end
end
