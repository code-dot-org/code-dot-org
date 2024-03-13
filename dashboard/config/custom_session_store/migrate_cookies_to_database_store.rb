require "action_dispatch/middleware/session/abstract_store"
require "active_support/core_ext/hash/keys"
require "rack/session/abstract/id"
require "rack/session/cookie"

module ActionDispatch
  module Session
    class MigrateCookiesToDatabaseStore < AbstractSecureStore
      def initialize(app, options = {})
        @database = options[:database] || Redis.new # TODO: Redis initialization details
        super(app, options.except(:database))
      end

      # Delete all session info from both the database and the cookie.
      def delete_session(request, session_id, options)
        @database.del(session_id.private_id)
        @database.del(session_id.public_id)
        generate_sid
      end

      # Get a session from the database
      def find_session(request, session_id)
        unless session_id && (session = get_session_with_fallback(session_id))
          session_id = generate_sid
          session = {}
        end
        [session_id, session]
      end

      # Set a session in the database
      def write_session(request, session_id, session, options)
        if session
          serialized_session_data = Marshal.dump(session)
          # TODO: verify format of expiry option
          @database.set(session_id.private_id, serialized_session_data, ex: options[:expire_after])
        else
          @database.del(session_id.private_id)
        end
        session_id
      end

      # Ultimately loads session data from the database, after first checking
      # for session data in the cookie and persisting it to the database if we
      # find any.
      def load_session(request)
        # migrate_session_data will return the extracted session id if there
        # was one; otherwise, we fetch the session id from the request object.
        session_id = migrate_session_data(request) || current_session_id(request)
        session_id, session = find_session(request, session_id)
        [session_id, session || {}]
      end

      private

      # If we already have existing session data in the cookie, this helper
      # method will clear the cookie, write that session data to the database,
      # and return the session id it extracted from the cookie.
      #
      # If the cookie does not contain any existing session data, do nothing
      # and return nothing.
      def migrate_session_data(request)
        stale_session_check! do
          session_data = unpacked_cookie_data(request)
          unless session_data.empty?
            session_id = Rack::Session::SessionId.new(session_data["session_id"])
            request.set_header("action_dispatch.request.unsigned_session_cookie", {})
            # TODO: check for existing session data before overwriting?
            # TODO: Confirm same value for warden.user.user.key?
            write_session(request, session_id, session_data.except("session_id"), request.session_options)
            return session_id
          end
        end
      end

      def get_session_with_fallback(session_id)
        raw_session_data = @database.get(session_id.private_id) || @database.get(session_id.public_id)
        Marshal.load(raw_session_data) if raw_session_data.present?
      end

      def unpacked_cookie_data(request)
        stale_session_check! do
          if data = get_cookie(request)
            data.stringify_keys!
          end
          data || {}
        end
      end

      def get_cookie(request)
        cookie_jar(request)[@key]
      end

      def cookie_jar(request)
        request.cookie_jar.signed_or_encrypted
      end
    end
  end
end
