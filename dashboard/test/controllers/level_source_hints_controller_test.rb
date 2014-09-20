require 'test_helper'

class LevelSourceHintsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @level_source = create(:level_source)
    @admin = create(:admin)
    @hint_accessor = create(:user)
    @hint_accessor.hint_access = true
    @hint_accessor.save!
    @teacher = create(:user)
    @teacher.user_type = User::TYPE_TEACHER
    @teacher.save!

    @not_hint_accessor = create(:user)
    @not_hint_accessor.hint_access = false
    @hint_accessor.save!
  end

  test "should redirect_add_pop_hint_if_not_signed_in" do
    get :add_hint, level_source_id: @level_source.id
    assert_response :redirect
    assert_redirected_to user_session_path
  end

  test "should get_add_pop_hint_if_admin" do
    sign_in(@admin)
    get :add_hint, level_source_id: @level_source.id
    assert_response :success
  end

  test "should get_add_pop_hint_if_hint_access" do
    sign_in(@hint_accessor)
    get :add_hint, level_source_id: @level_source.id
    assert_response :success
  end

  test "should get_add_pop_hint_if_teacher" do
    sign_in(@teacher)
    get :add_hint, level_source_id: @level_source.id
    assert_response :success
  end

  test "should not_get_add_pop_hint_if_without_hint_access" do
    sign_in(@not_hint_accessor)
    get :add_hint, level_source_id: @level_source.id
    assert_response :forbidden
  end

end
