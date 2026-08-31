require 'test_helper'

class BackpacksControllerTest < ActionController::TestCase
  setup do
    @user = create(:user)
    @storage_id = fake_storage_id_for_user_id(@user.id)
    @game_id = 68
  end

  test_redirect_to_sign_in_for :get_channel, params: {app_type: "javalab"}
  test_redirect_to_sign_in_for :get_channels

  test 'get_channel creates backpack if one does not exist' do
    sign_in @user
    Backpack.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)
    Backpack.any_instance.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)

    assert_nil Backpack.find_by(user_id: @user.id, game_id: @game_id)
    response = get :get_channel, params: {app_type: "javalab"}
    assert_response :success
    refute_nil Backpack.find_by(user_id: @user.id, game_id: @game_id)
    body = JSON.parse(response.body)
    channel = body['channel']
    storage_id, project_id = get_storage_id_and_project_id(channel)
    assert storage_id > 0 && project_id > 0
  end

  test 'get_channel with no app_type creates a backpack with no game' do
    sign_in @user
    Backpack.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)
    Backpack.any_instance.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)

    assert_nil Backpack.find_by(user_id: @user.id, game_id: nil)
    get :get_channel
    assert_response :success

    backpack = Backpack.find_by(user_id: @user.id, game_id: nil)
    refute_nil backpack
    assert_equal backpack.channel, JSON.parse(response.body)['channel']
  end

  test 'get_channel with no app_type reuses the backpack with no game' do
    sign_in @user
    Backpack.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)
    Backpack.any_instance.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)

    get :get_channel
    first_channel = JSON.parse(response.body)['channel']
    get :get_channel
    assert_response :success
    assert_equal first_channel, JSON.parse(response.body)['channel']
    assert_equal 1, Backpack.where(user_id: @user.id).count
  end

  test 'get_channels lists the channels of existing backpacks' do
    sign_in @user
    Backpack.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)
    Backpack.any_instance.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)

    javalab_backpack = Backpack.find_or_create(@user.id, @game_id, '1.2.3.4')
    universal_backpack = Backpack.find_or_create(@user.id, nil, '1.2.3.4')

    get :get_channels
    assert_response :success
    assert_equal(
      {
        'javalab' => javalab_backpack.channel,
        BackpacksController::UNIVERSAL_APP_TYPE => universal_backpack.channel,
      },
      JSON.parse(response.body)['channels']
    )
  end

  test 'get_channels does not create a backpack' do
    sign_in @user

    get :get_channels
    assert_response :success
    assert_empty JSON.parse(response.body)['channels']
    assert_empty Backpack.where(user_id: @user.id)
  end

  test 'get_channels only lists the current user backpacks' do
    other_user = create(:user)
    Backpack.stubs(:storage_id_for_user_id).with(other_user.id).returns(fake_storage_id_for_user_id(other_user.id))
    Backpack.any_instance.stubs(:storage_id_for_user_id).with(other_user.id).returns(fake_storage_id_for_user_id(other_user.id))
    Backpack.find_or_create(other_user.id, @game_id, '1.2.3.4')

    sign_in @user
    get :get_channels
    assert_response :success
    assert_empty JSON.parse(response.body)['channels']
  end

  test 'get_channel does not create a backpack if backpack already exists' do
    sign_in @user
    Backpack.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)
    Backpack.any_instance.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)

    assert_nil Backpack.find_by_user_id(@user.id)
    get :get_channel, params: {app_type: "javalab"}
    first_backpack = Backpack.find_by(user_id: @user.id, game_id: @game_id)
    assert_response :success
    get :get_channel, params: {app_type: "javalab"}
    second_backpack = Backpack.find_by(user_id: @user.id, game_id: @game_id)
    assert_equal(first_backpack.project_id, second_backpack.project_id)
  end
end
