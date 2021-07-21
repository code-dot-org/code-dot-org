require 'test_helper'
require 'testing/storage_apps_test_utils'

class BackpackTest < ActiveSupport::TestCase
  include StorageAppsTestUtils

  self.use_transactional_test_case = true

  setup_all do
    @user = create :user
  end

  test 'backpack is invalid if storage_app_id is invalid' do
    backpack = Backpack.new(user_id: @user.id, storage_app_id: 0)
    assert(!backpack.valid?)
  end

  test 'validation passes for valid backpack' do
    storage_app = StorageApps.new(1)
    encrypted_id = storage_app.create('', ip: 'test_ip', type: 'backpack')
    _, storage_app_id = storage_decrypt_channel_id(encrypted_id)
    backpack = Backpack.new(user_id: @user.id, storage_app_id: storage_app_id)
    assert(backpack.valid?)
  end
end
