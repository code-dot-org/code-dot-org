require 'rack/session/abstract/id'
require 'redis-actionpack'

module ActionDispatch
  module Session
    # Temporary helper module for the transition from cookie-based to
    # redis-based session storage. If a request contains actual session data
    # rather than just a session identifier, seamlessly write the session data
    # to redis. If a session has already been migrated, do nothing.
    #
    # TODO infra: once all user sessions have been migrated, remove this helper
    # and start using a non-customized implementation of redis-based session
    # storage.
    module MigrateCookiesStore
      # Ultimately loads session data from the data store, after first checking
      # for session data in the cookie and persisting it to the data store if
      # we find any.
      def load_session(request)
        # migrate_session_data will return the extracted session id if there
        # was one; otherwise, we fetch the session id from the request object.
        session_id = migrate_session_data(request) || current_session_id(request)
        session_id, session = find_session(request, session_id)
        [session_id, session || {}]
      end

      # If we already have existing session data in the cookie, this helper
      # method will clear the cookie, write that session data to the data
      # store, and return the session id it extracted from the cookie.
      #
      # If the cookie does not contain any existing session data, do nothing
      # and return nothing.
      private def migrate_session_data(request)
        # In preparation for eventually removing this module entirely and
        # switching to use an unmodified RedisStore instance, add a DCDO flag
        # to dynamically disable the custom functionality this module provides.
        return if DCDO.get('disable-migrate_session_data', false)
        stale_session_check! do
          session_data = unpacked_cookie_data(request)
          if session_data.is_a?(Hash) && !session_data.empty?
            session_id = Rack::Session::SessionId.new(session_data["session_id"])
            write_session(request, session_id, session_data.except("session_id"), request.session_options)
            request.set_header("action_dispatch.request.unsigned_session_cookie", {})
            return session_id
          end
        end
      rescue => exception
        # Something went wrong migrating session data to redis. Fail in a way
        # that lets load_session continue uninterrupted.
        Honeybadger.notify(exception, error_message: 'Error migrating session info to redis')
      end

      # Based on https://github.com/rails/rails/blob/v6.1.7.7/actionpack/lib/action_dispatch/middleware/session/cookie_store.rb#L86-L96
      private def unpacked_cookie_data(request)
        stale_session_check! do
          if data = get_cookie(request) && data.is_a?(Hash)
            data.stringify_keys!
          end
          data || {}
        end
      end
    end

    class MigrateCookiesToRedisStore < RedisStore
      include MigrateCookiesStore
    end
  end
end
