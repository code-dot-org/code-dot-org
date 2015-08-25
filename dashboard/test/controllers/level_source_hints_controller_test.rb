require 'test_helper'

class LevelSourceHintsControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @level = create(:level, :with_ideal_level_source)
    @unsuccessful_level_source = create(:level_source, level: @level)
    @frequent_unsuccessful_level_source =
      FrequentUnsuccessfulLevelSource.create!(active: true, level_source_id: @unsuccessful_level_source.id, level_id: @unsuccessful_level_source.level_id, num_of_attempts: 1000)

    @admin = create(:admin)

    @hint_accessor = create(:user)
    @hint_accessor.hint_access = true
    @hint_accessor.save!

    @teacher = create(:teacher)

    @not_hint_accessor = create(:student)
    @not_hint_accessor.hint_access = false
    @not_hint_accessor.save!
  end

  test "should redirect_add_hint_if_not_signed_in" do
    get :add_hint, level_source_id: @unsuccessful_level_source.id
    assert_response :redirect
    assert_redirected_to user_session_path
  end

  test "should get_add_hint_if_admin" do
    sign_in(@admin)
    get :add_hint, level_source_id: @unsuccessful_level_source.id
    assert_response :success
  end

  test "should get_add_hint_if_hint_access" do
    sign_in(@hint_accessor)
    get :add_hint, level_source_id: @unsuccessful_level_source.id
    assert_response :success
  end

  test "should get_add_hint_if_teacher" do
    sign_in(@teacher)
    get :add_hint, level_source_id: @unsuccessful_level_source.id
    assert_response :success
  end

  test "should not_get_add_hint_if_without_hint_access" do
    sign_in(@not_hint_accessor)
    get :add_hint, level_source_id: @unsuccessful_level_source.id
    assert_response :forbidden
  end

  test "should redirect_add_pop_hint_if_not_signed_in" do
    get :add_pop_hint, idx: 0
    assert_response :redirect
    assert_redirected_to user_session_path
  end

  test "should get_add_pop_hint_if_admin" do
    sign_in(@admin)
    get :add_pop_hint, idx: 0
    assert_response :success
  end

  test "should get_add_pop_hint_if_hint_access" do
    sign_in(@hint_accessor)
    get :add_pop_hint, idx: 0
    assert_response :success
  end

  test "should get_add_pop_hint_if_teacher" do
    sign_in(@teacher)
    get :add_pop_hint, idx: 0
    assert_response :success
  end

  test "should not_get_add_pop_hint_if_without_hint_access" do
    sign_in(@not_hint_accessor)
    get :add_pop_hint, idx: 0
    assert_response :forbidden
  end

  test "should get show_pop_hint_if_admin" do
    sign_in(@admin)
    get :show_pop_hints, idx: 0
    assert_response :success
  end

  test "should not get show_pop_hint_if_admin" do
    sign_in(@teacher)
    get :show_pop_hints, idx: 0
    assert_response :forbidden
  end

end
