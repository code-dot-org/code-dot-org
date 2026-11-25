# Be sure to restart your server when you modify this file.

# You can add backtrace silencers for libraries that you're using but don't wish to see in your backtraces.
# Rails.backtrace_cleaner.add_silencer { |line| line =~ /my_noisy_library/ }

# You can also remove all the silencers if you're trying to debug a problem that might stem from framework code.
# Rails.backtrace_cleaner.remove_silencers!

# In addition to backtrace silencing, we also want to silence annoying deprecations:
silenced = [
  'Calling warn on ActiveSupport::Deprecation is deprecated and will be removed from Rails',
  'Passing the coder as positional argument is deprecated and will be removed in Rails 7.2',
  'Starting in Rails 7.2, alias_attribute with non-attribute targets will raise.',
  'The `check_pending!` method is deprecated in favor of `check_all_pending!`',
  '`wait: :exponentially_longer` will actually wait polynomially longer and is therefore deprecated.',
  'assert_deprecated without a deprecator is deprecated',
]

silenced_expr = Regexp.new(silenced.join('|'))

Rails.application.deprecators.behavior = lambda do |message, callstack, deprecator|
  unless silenced.any? && message&.match?(silenced_expr)
    ActiveSupport::Deprecation::DEFAULT_BEHAVIORS[:stderr].call(message, callstack, deprecator)
  end
end
