# frozen_string_literal: true

require_relative '../test_helper'
require 'cdo/rake_tracing'
require 'opentelemetry/sdk'

class RakeTracingTest < Minitest::Test
  EXPORTER = OpenTelemetry::SDK::Trace::Export::InMemorySpanExporter.new

  def setup
    Cdo::RakeTracing.configure(OpenTelemetry::SDK::Trace::Export::SimpleSpanProcessor.new(EXPORTER))
    EXPORTER.reset
    @previous_application = Rake.application
    Rake.application = Rake::Application.new
  end

  def teardown
    Rake.application = @previous_application
    # Rake::Task stays patched for the rest of this process; without a tracer the patch does nothing.
    Cdo::RakeTracing.instance_variable_set(:@tracer, nil)
  end

  def test_prerequisites_nest_under_the_task_that_needs_them
    Rake::Task.define_task(:leaf)
    Rake::Task.define_task(middle: :leaf)
    Rake::Task.define_task(top: :middle).invoke
    assert_equal({'leaf' => 'middle', 'middle' => 'top', 'top' => nil}, span_parents)
  end

  def test_a_task_invoked_from_another_task_nests_under_it
    Rake::Task.define_task(:inner)
    Rake::Task.define_task(:outer) {Rake::Task[:inner].invoke}.invoke
    assert_equal({'inner' => 'outer', 'outer' => nil}, span_parents)
  end

  def test_multitask_prerequisites_nest_under_the_multitask
    Rake::Task.define_task(:first)
    Rake::Task.define_task(:second)
    Rake::MultiTask.define_task(both: [:first, :second]).invoke
    assert_equal({'first' => 'both', 'second' => 'both', 'both' => nil}, span_parents)
  end

  def test_traceparent_names_the_running_task_and_is_restored_afterward
    inherited = ENV.delete('TRACEPARENT')
    seen = nil
    Rake::Task.define_task(:spawner) {seen = ENV.fetch('TRACEPARENT', nil)}.invoke
    span = EXPORTER.finished_spans.first
    assert_equal "00-#{span.hex_trace_id}-#{span.hex_span_id}-01", seen
    assert_nil ENV.fetch('TRACEPARENT', nil)
  ensure
    ENV['TRACEPARENT'] = inherited
  end

  def test_a_failed_task_marks_its_span_as_an_error
    Rake::Task.define_task(:failing) {raise 'boom'}
    assert_raises(RuntimeError) {Rake::Task[:failing].invoke}
    assert_equal OpenTelemetry::Trace::Status::ERROR, EXPORTER.finished_spans.first.status.code
  end

  def test_a_task_invoked_twice_is_traced_once
    task = Rake::Task.define_task(:once)
    2.times {task.invoke}
    assert_equal 1, EXPORTER.finished_spans.size
  end

  def test_parent_context_reads_traceparent_from_the_environment
    traceparent = '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01'
    parent = OpenTelemetry::Trace.current_span(Cdo::RakeTracing.parent_context('TRACEPARENT' => traceparent)).context
    assert_equal '0af7651916cd43dd8448eb211c80319c', parent.hex_trace_id
    assert_equal 'b7ad6b7169203331', parent.hex_span_id
    assert parent.remote?
  end

  def test_parent_context_without_traceparent_has_no_span
    refute OpenTelemetry::Trace.current_span(Cdo::RakeTracing.parent_context({})).context.valid?
  end

  def test_enabled_by_config_or_by_the_commit_tag_in_ci
    CI::Utils.stubs(:tagged?).with(Cdo::RakeTracing::CI_TAG).returns(true)
    CDO.stubs(:enable_rake_tracing).returns(true)
    assert Cdo::RakeTracing.enabled?

    CDO.stubs(:enable_rake_tracing).returns(false)
    Object.stub_const(:ENV, ENV.to_h.merge('CI' => 'true')) {assert Cdo::RakeTracing.enabled?}
    Object.stub_const(:ENV, ENV.to_h.except('CI')) {refute Cdo::RakeTracing.enabled?}
  end

  def test_sentry_otlp_options_come_from_the_project_dsn
    options = Cdo::RakeTracing.sentry_otlp_options('https://key@o123.ingest.us.sentry.io/456')
    assert_equal 'https://o123.ingest.us.sentry.io/api/456/integration/otlp/v1/traces/', options[:endpoint]
    assert_equal({'x-sentry-auth' => 'sentry sentry_key=key'}, options[:headers])
  end

  # Maps each span's name to its parent's name; nil for a root span.
  private def span_parents
    spans = EXPORTER.finished_spans
    names = spans.to_h {|span| [span.span_id, span.name]}
    spans.to_h {|span| [span.name, names[span.parent_span_id]]}
  end
end
