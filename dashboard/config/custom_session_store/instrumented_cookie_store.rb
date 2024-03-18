require 'action_dispatch/middleware/session/cookie_store'
require 'objspace'

module ActionDispatch
  module Session
    class InstrumentedCookieStore < CookieStore
      METRICS_NAMESPACE = 'Session Store'.freeze

      def delete_session(req, session_id, options)
        Cdo::Metrics.put("#{METRICS_NAMESPACE}/delete_session", 1, {SessionId: session_id})
        super(req, session_id, options)
      end

      def load_session(req)
        session_id, session_data = super(req)
        session_size = ObjectSpace.memsize_of(session_data)
        Cdo::Metrics.put("#{METRICS_NAMESPACE}/load_session", 1, {SessionId: session_id, SessionSizeInBytes: session_size})
        [session_id, session_data]
      end

      private def write_session(req, sid, session_data, options)
        data = super(req, sid, session_data, options)
        session_size = ObjectSpace.memsize_of(session_data)
        Cdo::Metrics.put("#{METRICS_NAMESPACE}/write_session", 1, {SessionId: sid, SessionSizeInBytes: session_size})
        data
      end
    end
  end
end
