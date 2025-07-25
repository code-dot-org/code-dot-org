module Services
  module OpenTelemetry
    class FilteringSampler
      DROP_SAMPLER = ::OpenTelemetry::SDK::Trace::Samplers::ALWAYS_OFF

      def initialize(delegate)
        @delegate = delegate
      end

      def description
        'Custom filtering sampler for Ruby services'
      end

      # Only allow traces (the root span) from OpenTelemetry::Instrumentation::Rack to be sent.
      def should_sample?(trace_id:, parent_context:, links:, name:, kind:, attributes:)
        parent_span_context = ::OpenTelemetry::Trace.current_span(parent_context).context
        is_root_span = !parent_span_context.valid?

        # If the span is a root span and does not have an 'http.target' attribute, drop it.
        delegate = if is_root_span && !attributes&.dig('http.target')
                     DROP_SAMPLER
                   else
                     @delegate
                   end
        delegate.should_sample?(trace_id: trace_id, parent_context: parent_context, links: links, name: name, kind: kind, attributes: attributes)
      end
    end
  end
end
