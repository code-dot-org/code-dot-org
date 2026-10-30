require_relative 'lib/observability/version'

Gem::Specification.new do |spec|
  spec.name     = 'observability'
  spec.version  = Observability::VERSION
  spec.authors  = ['Code.org']
  spec.licenses = [Gem::Licenses::NONSTANDARD] # ['Code.org License']
  spec.summary  = 'Observability engine: OpenTelemetry tracing and Sentry error tracking for Dashboard'

  spec.files = Dir['{lib}/**/*', 'Rakefile']

  spec.metadata['rubygems_mfa_required'] = 'true'

  spec.required_ruby_version = '>= 3.1'

  spec.add_dependency 'rails', '~> 7.0.8'

  # OpenTelemetry
  spec.add_dependency 'opentelemetry-exporter-otlp', '~> 0.31.1'
  spec.add_dependency 'opentelemetry-sdk', '~> 1.10'
  # Pinned to 0.85.0 due to Rails 7.0 compatibility; remove pin when upgrading to Rails 7.1
  spec.add_dependency 'opentelemetry-instrumentation-all', '0.85.0'

  # Sentry
  spec.add_dependency 'sentry-opentelemetry', '~> 6.5'
  spec.add_dependency 'sentry-rails', '~> 6.5'
  spec.add_dependency 'sentry-ruby', '~> 6.5'

  # rubocop:disable Gemspec/DevelopmentDependencies
  spec.add_development_dependency 'minitest', '~> 5.15'
  spec.add_development_dependency 'mocha', '~> 2.1'
  # rubocop:enable Gemspec/DevelopmentDependencies
end
