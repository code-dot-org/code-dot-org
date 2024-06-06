require 'test_helper'

class BackpacksControllerTest < ActionController::TestCase
  setup_all do
    @user = create :user
    @storage_id = fake_storage_id_for_user_id(@user.id)
  end

  test_redirect_to_sign_in_for :get_channel

  test 'get_channel creates backpack if one does not exist' do
    sign_in @user
    Backpack.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)
    Backpack.any_instance.stubs(:storage_id_for_user_id).with(@user.id).returns(@storage_id)

    assert_nil Backpack.find_by_user_id(@user.id)
    response = get :get_channel
    assert_response :success
    refute_nil Backpack.find_by_user_id(@user.id)
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
    get :get_channel
    first_backpack = Backpack.find_by_user_id(@user.id)
    assert_response :success
    get :get_channel
    second_backpack = Backpack.find_by_user_id(@user.id)
    assert_equal(first_backpack.project_id, second_backpack.project_id)
  end
end
