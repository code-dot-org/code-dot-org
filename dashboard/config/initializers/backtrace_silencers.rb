# Be sure to restart your server when you modify this file.

# You can add backtrace silencers for libraries that you're using but don't wish to see in your backtraces.
# Rails.backtrace_cleaner.add_silencer { |line| line =~ /my_noisy_library/ }

# You can also remove all the silencers if you're trying to debug a problem that might stem from framework code.
# Rails.backtrace_cleaner.remove_silencers!

# In addition to backtrace silencing, we also want to silence annoying deprecations:
silenced = [
  # Added in https://github.com/rails/rails/pull/25337 for Rails 5.1; will be removed in Rails 5.2
  /The behavior of `[\w\?]*` inside of after callbacks will be changing in the next version of Rails./,
]

silenced_expr = Regexp.new(silenced.join('|'))

ActiveSupport::Deprecation.behavior = lambda do |message, callstack, deprecation_horizon, gem_name|
  unless message =~ silenced_expr
    ActiveSupport::Deprecation::DEFAULT_BEHAVIORS[:stderr].call(message, callstack, deprecation_horizon, gem_name)
  end
end
