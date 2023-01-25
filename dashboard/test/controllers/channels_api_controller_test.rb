require 'test_helper'

class ChannelsApiControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @storage = create(:project_storage)
    @storage_id = @storage.id
    @projects = Projects.new(@storage_id)
    @channel_id = @projects.create({}, ip: '10.0.0.1')
    ChannelsApiController.any_instance.stubs(:get_storage_id).returns(@storage_id)
  end

  teardown do
    ChannelsApiController.any_instance.unstub(:get_storage_id)
  end

  test "get abuse score" do
    response = get :show_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 0, JSON.parse(response.body)['abuse_score']
  end

  test "post abuse score" do
    response = post :update_abuse, params: {channel_id: @channel_id}
    assert response.ok?
  end

  test "delete abuse score" do
    response = get :show_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 0, JSON.parse(response.body)['abuse_score']

    response = delete :destroy_abuse, params: {channel_id: @channel_id}
    assert response.unauthorized?

    user = create(:project_validator)
    sign_in user

    response = delete :destroy_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 0, JSON.parse(response.body)['abuse_score']
  end

  test "signed in abuse" do
    DCDO.stubs(:get).with('restrict-abuse-reporting-to-verified', true).returns(false)

    user = create(:student)
    sign_in user

    # check initial state
    get :show_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 0, JSON.parse(response.body)['abuse_score']

    # authenticated non-teacher should get a score of 10
    post :update_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 10, JSON.parse(response.body)['abuse_score']

    DCDO.unstub(:get)
  end

  test "abuse frozen" do
    # freeze the project
    @projects.update(@channel_id, {frozen: true}, '10.0.0.1')

    get :show_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 0, JSON.parse(response.body)['abuse_score']

    user = create(:student)
    sign_in user

    post :update_abuse, params: {channel_id: @channel_id}
    assert response.ok?

    get :show_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 0, JSON.parse(response.body)['abuse_score']
  end

  test "base64 error" do
    causes_argumenterror = "bT0zAyBvk"
    causes_ciphererror = "IMALITTLETEAPOTSHORTANDSTOUT"

    assert_raises(ActionController::BadRequest) do
      get :show_abuse, params: {channel_id: causes_argumenterror}
    end

    assert_raises(ActionController::BadRequest) do
      get :show_abuse, params: {channel_id: causes_ciphererror}
    end
  end
end
