require 'test_helper'

class BackpacksControllerTest < ActionController::TestCase
  setup_all do
    @user = create :user
  end

  test_redirect_to_sign_in_for :get_channel

  test 'get_channel creates backpack if one does not exist' do
    sign_in @user
    assert_nil Backpack.find_by_user_id(@user.id)
    response = get :get_channel
    assert_response :success
    assert_not_nil Backpack.find_by_user_id(@user.id)
    body = JSON.parse(response.body)
    channel = body['channel']
    storage_id, storage_app_id = storage_decrypt_channel_id(channel)
    assert storage_id > 0 && storage_app_id > 0
  end

  test 'get_channel does not create a backpack if backpack already exists' do
    sign_in @user
    assert_nil Backpack.find_by_user_id(@user.id)
    get :get_channel
    first_backpack = Backpack.find_by_user_id(@user.id)
    assert_response :success
    get :get_channel
    second_backpack = Backpack.find_by_user_id(@user.id)
    assert_equal(first_backpack.storage_app_id, second_backpack.storage_app_id)
  end
end
