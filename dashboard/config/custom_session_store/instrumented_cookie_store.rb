require 'action_dispatch/middleware/session/cookie_store'
require 'objspace'

module ActionDispatch
  module Session
    # Simple wrapper around the standard Rails decentralized cookie-based
    # session store that we currently use in production. The primary goal is to
    # collect some data about current usage patterns, to inform our decisions
    # about a possible switch to a centralized session store.
    #
    # TODO infra: remove this helper after we've gathered enough data.
    class InstrumentedCookieStore < CookieStore
      METRICS_NAMESPACE = 'code-dot-org/ActionDispatch'.freeze
      METRICS_LOG_WINDOW = 1.minute

      # @see https://github.com/rails/rails/blob/ac87f58207cff18880593263be9d83456aa3a2ef/actionpack/lib/action_dispatch/middleware/session/cookie_store.rb#L104-L107
      private def write_session(req, session_id, session_data, options)
        log_session_info(session_id, session_data)
        super(req, session_id, session_data, options)
      end

      # Custom helper method to log some data about active sessions.
      # Specifically, this helper will record the IDs and sizes of all sessions
      # seen during a configurable window of time, and at the end of that
      # window will log to CloudWatch some data summarizing all sessions seen
      # during the window.
      private def log_session_info(session_id, session_data)
        @session_info ||= {}
        @session_info_last_logged_at ||= Time.now

        session_size = ObjectSpace.memsize_of(session_data)
        @session_info[session_id.private_id] = [session_size, @session_info.fetch(session_id.private_id, 0)].max

        if @session_info_last_logged_at < Time.now - METRICS_LOG_WINDOW
          num_sessions = @session_info.size
          Cdo::Metrics.put(METRICS_NAMESPACE, 'num_sessions_seen', num_sessions, {Environment: CDO.rack_env})
          average_size = @session_info.values.sum / num_sessions
          Cdo::Metrics.put(METRICS_NAMESPACE, 'average_max_session_size', average_size, {Environment: CDO.rack_env})
          @session_info = {}
          @session_info_last_logged_at = Time.now
        end
      rescue => e
        # Something went wrong logging. Lets fail in a way that lets write_session
        # continue uninterrupted, and doesn't fill our server's RAM up to failure.
        @session_info = {}
      end
    end
  end
end
