require 'action_dispatch/middleware/session/cookie_store'
require 'objspace'

module ActionDispatch
  module Session
    class InstrumentedCookieStore < CookieStore
      METRICS_NAMESPACE = 'code-dot-org/ActionDispatch'.freeze

      def delete_session(req, session_id, options)
        Cdo::Metrics.put(METRICS_NAMESPACE, 'delete_session_count', 1, {Environment: CDO.rack_env})
        super(req, session_id, options)
      end

      def load_session(req)
        session_id, session_data = super(req)
        Cdo::Metrics.put(METRICS_NAMESPACE, 'load_session_count', 1, {Environment: CDO.rack_env})
        session_size = ObjectSpace.memsize_of(session_data)
        Cdo::Metrics.put(METRICS_NAMESPACE, 'load_session_size', session_size, {Environment: CDO.rack_env})
        [session_id, session_data]
      end

      private def write_session(req, sid, session_data, options)
        data = super(req, sid, session_data, options)
        Cdo::Metrics.put(METRICS_NAMESPACE, 'write_session_count', 1, {Environment: CDO.rack_env})
        session_size = ObjectSpace.memsize_of(session_data)
        Cdo::Metrics.put(METRICS_NAMESPACE, 'write_session_size', session_size, {Environment: CDO.rack_env})
        data
      end
    end
  end
end
