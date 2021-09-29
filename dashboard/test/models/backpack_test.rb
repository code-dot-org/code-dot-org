require 'test_helper'
require 'testing/storage_apps_test_utils'

class BackpackTest < ActiveSupport::TestCase
  include StorageAppsTestUtils

  self.use_transactional_test_case = true

  setup_all do
    @user = create :user
  end

  test 'find_or_create creates storage_app if backpack does not exist' do
    backpack = Backpack.find_or_create(@user.id, 'fake-ip')
    assert backpack.storage_app_id > 0
    assert_equal @user.id, backpack.user_id
  end

  # storage apps with value hidden are hidden from a user's projects list
  test 'storage_app that is created has value hidden = true' do
    backpack = Backpack.find_or_create(@user.id, 'fake-ip')
    storage_app = StorageApps.new(backpack.storage_app_id).get(backpack.channel)
    assert storage_app["hidden"]
  end

  test 'find_or_create returns existing backpack if it exists' do
    backpack = Backpack.find_or_create(@user.id, 'fake-ip')
    backpack2 = Backpack.find_or_create(@user.id, 'fake-ip')
    assert_equal(backpack, backpack2)
  end
end
