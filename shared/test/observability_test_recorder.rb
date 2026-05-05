require 'opentelemetry'

# Test helper that captures span events recorded during a test by stubbing
# OpenTelemetry::Trace.current_span with a recording double. Call install in
# setup; mocha resets stubs between tests so re-installing per-test is required.
# Read captures via .events / .get_events; .install clears prior captures.
module ObservabilityTestRecorder
  def self.events
    @@events ||= []
  end

  def self.get_events(regex)
    events.select {|name, _| regex.match(name)}
  end

  def self.reset
    @@events = []
  end

  def self.install
    reset
    events_ref = events

    span = Object.new
    span.define_singleton_method(:add_event) do |name, attributes: {}|
      events_ref << [name.to_s, attributes || {}]
    end

    valid_ctx = Object.new
    valid_ctx.define_singleton_method(:valid?) {true}
    span.define_singleton_method(:context) {valid_ctx}

    ::OpenTelemetry::Trace.stubs(:current_span).returns(span)
  end
end
