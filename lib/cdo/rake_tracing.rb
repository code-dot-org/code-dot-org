# frozen_string_literal: true

require 'rake'
require 'cdo/ci_utils'

# OpenTelemetry tracing for rake: one span per rake process and one per task invocation. A task's span covers its
# prerequisites, so they nest under it; opentelemetry-instrumentation-rake leaves them as siblings. Child processes
# join the trace through the TRACEPARENT environment variable, which names the span of the task that spawned them.
module Cdo
  module RakeTracing
    # A CI build traces its rake tasks when its commit message carries "[trace rake]".
    CI_TAG = 'trace rake'
    SHUTDOWN_TIMEOUT_SECONDS = 10

    class << self
      attr_reader :tracer
    end

    def self.enabled?
      CDO.enable_rake_tracing || (ENV.fetch('CI', nil) && CI::Utils.tagged?(CI_TAG))
    end

    # Call from a Rakefile before any task runs.
    def self.start
      return if @tracer || !enabled?

      require 'opentelemetry/sdk'
      exporter = otlp_exporter
      return warn('[rake tracing] Not tracing: set rake_sentry_dsn, or OTEL_EXPORTER_OTLP_ENDPOINT.') unless exporter

      configure(OpenTelemetry::SDK::Trace::Export::BatchSpanProcessor.new(exporter))
      start_process_span
      pid = Process.pid
      # Forked children inherit this handler; only the process that opened the span may close it.
      at_exit {finish($!) if Process.pid == pid}
    end

    def self.configure(span_processor)
      require 'opentelemetry/sdk'
      OpenTelemetry::SDK.configure do |config|
        config.service_name = 'rake'
        config.resource = OpenTelemetry::SDK::Resources::Resource.create('deployment.environment' => CDO.rack_env.to_s)
        config.add_span_processor(span_processor)
      end
      @provider = OpenTelemetry.tracer_provider
      @tracer = @provider.tracer('Cdo::RakeTracing')
      Rake::Task.prepend(TaskPatch)
    end

    # The standard OTLP variables win, so a local collector or Jaeger can stand in for Sentry.
    def self.otlp_exporter
      require 'opentelemetry-exporter-otlp'
      if ENV['OTEL_EXPORTER_OTLP_TRACES_ENDPOINT'] || ENV['OTEL_EXPORTER_OTLP_ENDPOINT']
        OpenTelemetry::Exporter::OTLP::Exporter.new
      elsif !CDO.rake_sentry_dsn.to_s.empty?
        OpenTelemetry::Exporter::OTLP::Exporter.new(**sentry_otlp_options(CDO.rake_sentry_dsn))
      end
    end

    def self.sentry_otlp_options(dsn_string)
      require 'sentry/dsn'
      dsn = ::Sentry::DSN.new(dsn_string)
      {
        endpoint: "#{dsn.server}#{dsn.otlp_traces_endpoint}",
        headers: {'x-sentry-auth' => "sentry sentry_key=#{dsn.public_key}"},
      }
    end

    def self.parent_context(env = ENV)
      carrier = {'traceparent' => env['TRACEPARENT'], 'tracestate' => env['TRACESTATE']}.compact
      OpenTelemetry::Trace::Propagation::TraceContext.text_map_propagator.
        extract(carrier, context: OpenTelemetry::Context.empty)
    end

    def self.start_process_span
      parent = parent_context
      tasks = Rake.application.top_level_tasks.map {|task| task.split('[').first}
      @process_span = @tracer.start_span("rake #{tasks.join(' ')}", with_parent: parent, attributes: process_attributes)
      OpenTelemetry::Context.attach(OpenTelemetry::Trace.context_with_span(@process_span, parent_context: parent))
      ENV['TRACEPARENT'] = traceparent(@process_span)
      # A child process joins its parent's trace, whose id the parent has already printed.
      return if OpenTelemetry::Trace.current_span(parent).context.valid?
      warn "[rake tracing] trace id #{@process_span.context.hex_trace_id}"
    end

    def self.process_attributes
      require 'cdo/git_utils'
      {
        'process.pid' => Process.pid,
        # In Drone, HEAD merges the pull request into its base; GIT_COMMIT is the pull request's own commit.
        'vcs.ref.head.revision' => ENV.fetch('GIT_COMMIT') {GitUtils.git_revision},
        'cicd.pipeline.name' => ENV.fetch('DRONE_STAGE_NAME', nil),
        'cicd.pipeline.run.id' => ENV.fetch('DRONE_BUILD_NUMBER', nil),
      }.reject {|_, value| value.to_s.empty?}
    end

    # ENV is process-wide, so a child spawned during a multitask may name a sibling task's span as its parent.
    def self.with_traceparent(span)
      previous = ENV.fetch('TRACEPARENT', nil)
      ENV['TRACEPARENT'] = traceparent(span)
      yield
    ensure
      ENV['TRACEPARENT'] = previous
    end

    def self.traceparent(span)
      OpenTelemetry::Trace::Propagation::TraceContext::TraceParent.from_span_context(span.context).to_s
    end

    def self.finish(error)
      failed = error && !(error.is_a?(SystemExit) && error.success?)
      @process_span.status = OpenTelemetry::Trace::Status.error(error.class.name) if failed
      @process_span.finish
      @provider.shutdown(timeout: SHUTDOWN_TIMEOUT_SECONDS)
    end

    module TaskPatch
      attr_reader :otel_context

      def invoke_with_call_chain(task_args, invocation_chain)
        tracer = RakeTracing.tracer
        return super if tracer.nil? || already_invoked

        # A multitask runs prerequisites on pool threads, where the current context is empty.
        parent = invocation_chain.head&.otel_context || OpenTelemetry::Context.current
        OpenTelemetry::Context.with_current(parent) do
          tracer.in_span(name, attributes: {'rake.task' => name}) do |span, context|
            @otel_context = context
            RakeTracing.with_traceparent(span) {super}
          end
        end
      end
    end
  end
end
