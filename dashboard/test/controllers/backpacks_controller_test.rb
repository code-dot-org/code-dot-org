require 'test_helper'

class BackpacksControllerTest < ActionController::TestCase
  setup_all do
    @user = create(:user)
    @storage_id = fake_storage_id_for_user_id(@user.id)
    @game_id = 68
  end

  test_redirect_to_sign_in_for :get_channel, params: {app_type: "javalab"}

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
    storage_id, project_id = storage_decrypt_channel_id(channel)
    assert storage_id > 0 && project_id > 0
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
