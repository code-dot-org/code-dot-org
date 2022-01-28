require 'test_helper'
require 'dynamic_config/offline_mode'

class OfflineModeTest < ActionController::TestCase
  test 'returns false if unset' do
    assert_equal false, OfflineMode.get(@request)
  end

  test 'get and set' do
    OfflineMode.set_default true
    assert_equal true, OfflineMode.get(@request)
    OfflineMode.set_default false
    assert_equal false, OfflineMode.get(@request)
  end
end
