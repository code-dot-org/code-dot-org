require 'test_helper'

class TeacherPrizesControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  setup do
    @teacher_prize = teacher_prizes(:one)
    @user = create(:admin)
    sign_in(@user)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:teacher_prizes)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create teacher_prize" do
    assert_difference('TeacherPrize.count') do
      post :create, teacher_prize: { code: @teacher_prize.code, prize_provider_id: @teacher_prize.prize_provider_id, user: @teacher_prize.user }
    end

    assert_redirected_to teacher_prize_path(assigns(:teacher_prize))
  end

  test "should show teacher_prize" do
    get :show, id: @teacher_prize
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @teacher_prize
    assert_response :success
  end

  test "should update teacher_prize" do
    patch :update, id: @teacher_prize, teacher_prize: { code: @teacher_prize.code, prize_provider: @teacher_prize.prize_provider, user: @teacher_prize.user }
    assert_redirected_to teacher_prize_path(assigns(:teacher_prize))
  end

  test "should destroy teacher_prize" do
    assert_difference('TeacherPrize.count', -1) do
      delete :destroy, id: @teacher_prize
    end

    assert_redirected_to teacher_prizes_path
  end
end
