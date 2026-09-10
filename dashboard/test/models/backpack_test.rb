require 'test_helper'
require 'testing/projects_test_utils'

class BackpackTest < ActiveSupport::TestCase
  include ProjectsTestUtils

  setup_all do
    @user = create(:user)
    @storage_id = fake_storage_id_for_user_id(@user.id)
    @game_id = 68
  end

  test 'find_or_create creates project if backpack does not exist' do
    Backpack.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)
    backpack = Backpack.find_or_create(@user.id, @game_id, 'fake-ip')
    assert backpack.project_id > 0
    assert_equal @user.id, backpack.user_id
    assert_equal @game_id, backpack.game_id
  end

  # projects with value hidden are hidden from a user's projects list
  test 'project that is created has value hidden = true' do
    Backpack.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)
    Backpack.any_instance.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)
    backpack = Backpack.find_or_create(@user.id, @game_id, 'fake-ip')
    project = Projects.new(@storage_id).get(backpack.channel)
    assert project["hidden"]
  end

  test 'find_or_create creates a backpack with no game when game_id is nil' do
    Backpack.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)
    backpack = Backpack.find_or_create(@user.id, nil, 'fake-ip')
    assert backpack.project_id > 0
    assert_nil backpack.game_id
  end

  test 'find_or_create serializes creation of the backpack with no game on the user row' do
    Backpack.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)
    User.any_instance.expects(:with_lock).once.yields
    Backpack.find_or_create(@user.id, nil, 'fake-ip')
  end

  test 'find_or_create returns the existing backpack with no game without locking' do
    Backpack.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)
    backpack = Backpack.find_or_create(@user.id, nil, 'fake-ip')
    User.any_instance.expects(:with_lock).never
    assert_equal(backpack, Backpack.find_or_create(@user.id, nil, 'fake-ip'))
  end

  test 'find_or_create returns existing backpack if it exists' do
    Backpack.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)
    backpack = Backpack.find_or_create(@user.id, @game_id, 'fake-ip')
    backpack2 = Backpack.find_or_create(@user.id, @game_id, 'fake-ip')
    assert_equal(backpack, backpack2)
  end
end
