require 'rspec/mocks'

class Minitest::Spec
  module DSL
    module InstanceMethods
      # Removes the MiniTest Spec `expect` alias for the method `_`
      # to ensure compatibility with the RSpec Mocks `expect` method
      remove_method(:expect) if method_defined?(:expect)
    end
  end
end

class ActiveSupport::TestCase
  include RSpec::Mocks::ExampleMethods

  def before_setup
    RSpec::Mocks.setup
    super
  end

  def after_teardown
    RSpec::Mocks.verify
  ensure
    RSpec::Mocks.teardown
    super
  end
end
