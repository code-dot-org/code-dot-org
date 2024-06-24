require 'minitest/mock'
require 'rspec/mocks'

# Including this module in a Minitest class enables the use of RSpec mocks.
# @note This module replacing the default Minitest mocks with RSpec mocks.
# @example Using RSpec mocks in an ActiveSupport test case
#  class MyTest < ActiveSupport::TestCase
#     include Minitest::RSpecMocks
#
#     test 'using RSpec mocks' do
#       expect(obj).to receive(:foo).and_return('bar')
#       assert_equal 'bar', obj.foo
#     end
#   end
module Minitest
  module RSpecMocks
    extend ActiveSupport::Concern
    include RSpec::Mocks::ExampleMethods

    # included do
    #   remove_method(:expect) if method_defined?(:expect)
    #   remove_method(:stub) if method_defined?(:stub)
    # end

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
end
