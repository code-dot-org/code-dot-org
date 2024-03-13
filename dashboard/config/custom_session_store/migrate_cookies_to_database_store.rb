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
      def delete_session(req, session_id, options)
        @database.del(session_id.private_id)
        @database.del(session_id.public_id) # TODO: do we actually need public_id logic?
        req.set_header("action_dispatch.request.unsigned_session_cookie", {})
        generate_sid
      end

      # Get a session from the database
      def find_session(env, sid)
        unless sid && (session = get_session_with_fallback(sid))
          sid = generate_sid
          session = {}
        end
        [sid, session]
      end

      # Set a session in the database
      def write_session(env, sid, session, options)
        if session
          serialized_session_data = Marshal.dump(session)
          @database.set(sid.private_id, serialized_session_data, ex: options[:expire_after]) # TODO: verify format of expiry option
        else
          @database.del(sid.private_id)
        end
        sid
      end

      # Ultimately loads session data from the database, after first checking
      # for session data in the cookie and persisting it to the database if we
      # find any.
      def load_session(req)
        session_id = current_session_id(req)

        stale_session_check! do
          session_data = unpacked_cookie_data(req)
          unless session_data.empty?
            session_id = Rack::Session::SessionId.new(session_data["session_id"])
            delete_session(req, session_id, req.session_options)
            # TODO: check for existing session data? Confirm same value for warden.user.user.key?
            write_session(req, session_id, session_data.except("session_id"), req.session_options)
          end
        end

        session_id, session = find_session(req, session_id)
        [session_id, session || {}]
      end

      private

      # TODO: do we actually need the fallback here?
      def get_session_with_fallback(sid)
        raw_session_data = @database.get(sid.private_id) || @database.get(sid.public_id)
        Marshal.load(raw_session_data) if raw_session_data.present?
      end

      def unpacked_cookie_data(req)
        stale_session_check! do
          if data = get_cookie(req)
            data.stringify_keys!
          end
          data || {}
        end
      end

      def get_cookie(req)
        cookie_jar(req)[@key]
      end

      def cookie_jar(request)
        request.cookie_jar.signed_or_encrypted
      end
    end
  end
end
