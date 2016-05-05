require 'test_helper'

class PeerReviewsControllerTest < ActionController::TestCase
  setup do
    @peer_review = peer_reviews(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:peer_reviews)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create peer_review" do
    assert_difference('PeerReview.count') do
      post :create, peer_review: { data: @peer_review.data, from_instructor: @peer_review.from_instructor, level_id: @peer_review.level_id, level_source_id: @peer_review.level_source_id, script_id: @peer_review.script_id, status: @peer_review.status, user_id: @peer_review.user_id }
    end

    assert_redirected_to peer_review_path(assigns(:peer_review))
  end

  test "should show peer_review" do
    get :show, id: @peer_review
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @peer_review
    assert_response :success
  end

  test "should update peer_review" do
    patch :update, id: @peer_review, peer_review: { data: @peer_review.data, from_instructor: @peer_review.from_instructor, level_id: @peer_review.level_id, level_source_id: @peer_review.level_source_id, script_id: @peer_review.script_id, status: @peer_review.status, user_id: @peer_review.user_id }
    assert_redirected_to peer_review_path(assigns(:peer_review))
  end

  test "should destroy peer_review" do
    assert_difference('PeerReview.count', -1) do
      delete :destroy, id: @peer_review
    end

    assert_redirected_to peer_reviews_path
  end
end
