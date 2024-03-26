require 'rack/session/abstract/id'
require 'action_dispatch/middleware/session/cookie_store'

module ActionDispatch
  module Session
    class MirrorCookiesInRedisStore < CookieStore
      def initialize(app, options = {})
        puts options
        @redis = Redis.new(url: options[:server])
        super(app, options.except(:server))
      end

      # @see https://github.com/rails/rails/blob/ac87f58207cff18880593263be9d83456aa3a2ef/actionpack/lib/action_dispatch/middleware/session/cookie_store.rb#L104-L107
      private def write_session(req, session_id, session_data, options)
        mirror_session_in_redis(session_id, session_data)
        super(req, session_id, session_data, options)
      end

      private def mirror_session_in_redis(session_id, session_data)
        serialized_session_data = Marshal.dump(session_data)
        puts "@redis.set(#{session_id.private_id}, #{serialized_session_data})"
        @redis.set(session_id.private_id, serialized_session_data)
      rescue => exception
        # Something went wrong writing session data to redis. Fail in a way
        # that lets write_session continue uninterrupted.
        Honeybadger.notify(exception, error_message: 'Error writing session info to redis')
      end
    end
  end
end
