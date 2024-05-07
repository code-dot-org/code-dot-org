require 'rack/session/abstract/id'
require 'action_dispatch/middleware/session/cookie_store'

module ActionDispatch
  module Session
    # Simple extension to the standard Rails cookie-based session storage that
    # also writes cookie data to Redis without attempting to read or rely on
    # that data.
    #
    # Intended for short-term use, just to confirm that our assessment of our
    # Redis needs is accurate and build some confidence in stability in advance
    # of the actual switchover.
    #
    # TODO infra: replace this with an actual Redis-based implementation (a la
    # https://github.com/code-dot-org/code-dot-org/pull/57252) once we're ready.
    class MirrorCookiesInRedisStore < CookieStore
      def initialize(app, options = {})
        @redis = Redis.new(url: options[:server])
        super(app, options.except(:server))
      end

      # @see https://github.com/rails/rails/blob/v6.1.7.7/actionpack/lib/action_dispatch/middleware/session/cookie_store.rb#L63-L68
      def delete_session(req, session_id, options)
        remove_session_from_redis(session_id) if DCDO.get('mirror_session_in_redis_enabled', false)
        super(req, session_id,  options)
      end

      # @see https://github.com/rails/rails/blob/v6.1.7.7/actionpack/lib/action_dispatch/middleware/session/cookie_store.rb#L104-L107
      private def write_session(req, session_id, session_data, options)
        write_session_to_redis(session_id, session_data) if DCDO.get('mirror_session_in_redis_enabled', false)
        super(req, session_id, session_data, options)
      end

      private def write_session_to_redis(session_id, session_data)
        @redis.set(session_id.private_id, session_data)
      rescue => exception
        # Something went wrong writing session data to redis. Fail in a way
        # that lets write_session continue uninterrupted.
        Honeybadger.notify(exception, error_message: 'Error writing session info to redis')
      end

      private def remove_session_from_redis(session_id)
        @redis.del(session_id.private_id)
      rescue => exception
        # Something went wrong deleting session data from redis. Fail in a way
        # that lets delete_session continue uninterrupted.
        Honeybadger.notify(exception, error_message: 'Error deleting session info from redis')
      end
    end
  end
end
