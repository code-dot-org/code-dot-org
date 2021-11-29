# Be sure to restart your server when you modify this file.

# You can add backtrace silencers for libraries that you're using but don't wish to see in your backtraces.
# Rails.backtrace_cleaner.add_silencer { |line| line =~ /my_noisy_library/ }

# You can also remove all the silencers if you're trying to debug a problem that might stem from framework code.
# Rails.backtrace_cleaner.remove_silencers!

# In addition to backtrace silencing, we also want to silence annoying deprecations:
silenced = [
  # Added in Rails 5.2
  /Single arity template handlers are deprecated/,
  /Dangerous query method \(method whose arguments are used as raw SQL\) called with non-attribute argument\(s\)/,
  /SourceAnnotationExtractor is deprecated! Use Rails::SourceAnnotationExtractor instead/,

  # Added in Rails 6.0
  /Uniqueness validator will no longer enforce case sensitive comparison in Rails 6.1/,
  /The asset ".*" is not present in the asset pipeline.Falling back to an asset that may be in the public folder./,
  /NOT conditions will no longer behave as NOR in Rails 6.1. To continue using NOR conditions, NOT each condition individually/,
]

silenced_expr = Regexp.new(silenced.join('|'))

ActiveSupport::Deprecation.behavior = lambda do |message, callstack, deprecation_horizon, gem_name|
  unless message =~ silenced_expr
    ActiveSupport::Deprecation::DEFAULT_BEHAVIORS[:stderr].call(message, callstack, deprecation_horizon, gem_name)
  end
end
