# Be sure to restart your server when you modify this file.

# You can add backtrace silencers for libraries that you're using but don't wish to see in your backtraces.
# Rails.backtrace_cleaner.add_silencer { |line| line =~ /my_noisy_library/ }

# You can also remove all the silencers if you're trying to debug a problem that might stem from framework code.
# Rails.backtrace_cleaner.remove_silencers!

# silence annoying deprecations
silenced = [
  /ActionController::TestCase HTTP request methods/,
  /ActionDispatch::IntegrationTest HTTP request methods/,
  /`render :text` is deprecated/,
  /alias_method_chain is deprecated/
]

silenced_expr = Regexp.new(silenced.join('|'))

ActiveSupport::Deprecation.behavior = lambda do |msg, stack|
  unless msg =~ silenced_expr
    ActiveSupport::Deprecation::DEFAULT_BEHAVIORS[:stderr].call(msg, stack)
  end
end
