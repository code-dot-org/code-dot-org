require 'test_helper'

class MusiclabControllerTest < ActionController::TestCase
  test 'When DCDO flag is set to `true` channel ids from constant returns true ' do
    DCDO.stubs(:get).with('get_channel_ids_from_constant', false).returns(true)
    assert_equal true, @controller.send(:get_channel_ids_from_constant?)
  end
end
