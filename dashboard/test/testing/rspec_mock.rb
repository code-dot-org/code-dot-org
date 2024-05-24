require 'rspec/mocks'

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
