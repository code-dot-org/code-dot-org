require 'opentelemetry'

# Test helper that captures span attributes set during a test by stubbing
# OpenTelemetry::Trace.current_span with a recording double. Call install in
# setup; mocha resets stubs between tests so re-installing per-test is required.
# Read captures via .attribute_log (ordered) or .attributes (last-write-wins).
module ObservabilityTestRecorder
  # Ordered list of [key, value] tuples, one entry per set_attribute call.
  # Preserves repeat sets so tests can assert call count and order.
  def self.attribute_log
    @@attribute_log ||= []
  end

  # Last-write-wins snapshot, mirroring what OTel actually retains on the span.
  def self.attributes
    attribute_log.each_with_object({}) {|(k, v), h| h[k] = v}
  end

  # Filter the ordered log to entries whose key matches the regex.
  def self.matching(regex)
    attribute_log.select {|key, _| regex.match(key)}
  end

  def self.reset
    @@attribute_log = []
  end

  def self.install
    reset
    log_ref = attribute_log

    span = Object.new
    span.define_singleton_method(:set_attribute) do |key, value|
      log_ref << [key.to_s, value]
    end

    valid_ctx = Object.new
    valid_ctx.define_singleton_method(:valid?) {true}
    span.define_singleton_method(:context) {valid_ctx}

    ::OpenTelemetry::Trace.stubs(:current_span).returns(span)
  end
end
