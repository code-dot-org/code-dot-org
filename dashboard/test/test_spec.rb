require 'test_helper'
require 'rspec/mocks'
require 'minitest-spec-rails'

class ActiveSupport::TestCase
  include RSpec::Mocks::ExampleMethods

  def before_setup
    RSpec::Mocks.setup
    super
  end

  def after_teardown
    begin
      ::RSpec::Mocks.verify
    ensure
      ::RSpec::Mocks.teardown
    end
    super
  end
end
