require 'test_helper'

class TeacherBonusPrizesControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @teacher_bonus_prize = teacher_bonus_prizes(:one)
    @user = create(:admin)
    sign_in(@user)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:teacher_bonus_prizes)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create teacher_bonus_prize" do
    assert_difference('TeacherBonusPrize.count') do
      post :create, teacher_bonus_prize: { code: @teacher_bonus_prize.code, prize_provider_id: @teacher_bonus_prize.prize_provider_id, user_id: @teacher_bonus_prize.user_id }
    end

    assert_redirected_to teacher_bonus_prize_path(assigns(:teacher_bonus_prize))
  end

  test "should show teacher_bonus_prize" do
    get :show, id: @teacher_bonus_prize
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @teacher_bonus_prize
    assert_response :success
  end

  test "should update teacher_bonus_prize" do
    patch :update, id: @teacher_bonus_prize, teacher_bonus_prize: { code: @teacher_bonus_prize.code, prize_provider_id: @teacher_bonus_prize.prize_provider_id, user_id: @teacher_bonus_prize.user_id }
    assert_redirected_to teacher_bonus_prize_path(assigns(:teacher_bonus_prize))
  end

  test "should destroy teacher_bonus_prize" do
    assert_difference('TeacherBonusPrize.count', -1) do
      delete :destroy, id: @teacher_bonus_prize
    end

    assert_redirected_to teacher_bonus_prizes_path
  end
end
