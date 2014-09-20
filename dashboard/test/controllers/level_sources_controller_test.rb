require 'test_helper'

class LevelSourcesControllerTest < ActionController::TestCase
  include Devise::TestHelpers
  setup do
    @user = create(:admin)
    @level_source = create(:level_source)
    sign_in(@user)
  end

  test "should get edit" do
    get :edit, id: @level_source.id
    assert_response :success
    assert_equal([], assigns(:callouts))
  end

  test "should get show" do
    get :show, id: @level_source.id
    assert_response :success
    assert_equal([], assigns(:callouts))
  end

  test "generate image routing" do
    assert_routing({method: "get", path: "/sh/1/generate_image"}, {controller: "level_sources", action: "generate_image", id: "1"})
  end

end
