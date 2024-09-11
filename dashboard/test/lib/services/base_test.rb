require 'test_helper'

class Services::BaseTest < ActiveSupport::TestCase
  let(:child_class) {TestService = Class.new(Services::Base)}

  describe '.call' do
    it 'inits new instance and calls instance method' do
      expected_arg = 'expected_arg'
      expected_result = 'expected_result'

      child_class.expects(:new).with(expected_arg).returns(mock(call: expected_result))

      _(child_class.call(expected_arg)).must_equal expected_result
    end
  end

  describe '#call' do
    let(:call) {child_class.new.call}

    it 'raises NotImplementedError by default' do
      _ {call}.must_raise NotImplementedError
    end
  end
end
