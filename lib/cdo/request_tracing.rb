# frozen_string_literal: true

require 'digest'
require 'securerandom'
require 'request_store'

module RequestTracing
  TRACEPARENT_KEY = :traceparent

  module_function def ensure_traceparent!(request_id)
    return unless request_id
    return current_traceparent if current_traceparent

    traceparent = build_traceparent(request_id)
    set_traceparent(traceparent)
    traceparent
  end

  module_function def current_traceparent
    defined?(RequestStore) ? RequestStore.store[TRACEPARENT_KEY] : nil
  end

  module_function def set_traceparent(traceparent)
    return unless defined?(RequestStore)
    return unless traceparent

    RequestStore.store[TRACEPARENT_KEY] = traceparent
  end

  module_function def clear_traceparent
    return unless defined?(RequestStore)

    RequestStore.store.delete(TRACEPARENT_KEY)
  end

  module_function def build_traceparent(request_id, flags: '01')
    trace_id = Digest::SHA256.hexdigest(request_id.to_s)[0, 32]
    parent_id = Digest::SHA256.hexdigest("parent:#{request_id}")[0, 16]
    "00-#{trace_id}-#{parent_id}-#{flags}"
  end
end
