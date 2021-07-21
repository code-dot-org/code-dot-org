require 'test_helper'
require 'testing/storage_apps_test_utils'

class BackpackTest < ActiveSupport::TestCase
  include StorageAppsTestUtils

  self.use_transactional_test_case = true

  setup_all do
    @user = create :user
  end

  test 'backpack is invalid if storage_app_id is duplicated' do
    backpack = Backpack.new(user_id: @user.id, storage_app_id: 1)
    backpack.save!
    user2 = create :user
    backpack2 = Backpack.new(user_id: user2.id, storage_app_id: 1)
    assert(!backpack2.valid?)
  end

  test 'find_or_create creates storage_app if backpack does not exist' do
    backpack = Backpack.find_or_create(@user.id, 'fake-ip')
    assert backpack.storage_app_id > 0
    assert_equal @user.id, backpack.user_id
  end

  test 'find_or_create returns existing backpack if it exists' do
    backpack = Backpack.find_or_create(@user.id, 'fake-ip')
    backpack2 = Backpack.find_or_create(@user.id, 'fake-ip')
    assert_equal(backpack, backpack2)
  end
end
