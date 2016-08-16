
require 'test_helper'

class GalleryActivitiesControllerTest < ActionController::TestCase
  setup do
    @user = create(:user)
    @activity = create(:activity, user: @user,
                       level: create(:level, game: Game.find_by_app(Game::ARTIST)),
                       level_source: create(:level_source, level_source_image: create(:level_source_image)))
    @gallery_activity = create(:gallery_activity, user: @user, activity: @activity, autosaved: false)

    @playlab_activity = create(:activity, user: @user,
                               level: create(:level, game: Game.find_by_app(Game::PLAYLAB)),
                               level_source: create(:level_source, level_source_image: create(:level_source_image)))
    @playlab_gallery_activity = create(:gallery_activity, user: @user, activity: @playlab_activity, autosaved: false)

    @new_activity = create(:activity, user: @user, level: create(:level, game: Game.find_by_app(Game::PLAYLAB)))

    @autosaved_gallery_activity = create(:gallery_activity, user: @user, autosaved: true)
  end

  test "index works with empty gallery" do
    GalleryActivity.destroy_all

    get :index
    assert_response :success
  end

  test "should show index" do
    get :index

    assert_response :success

    # does not include the autosaved one
    assert_equal [@gallery_activity], assigns(:artist_gallery_activities)

    assert_equal [@playlab_gallery_activity], assigns(:playlab_gallery_activities)
  end

  test "should show index with only art" do
    get :index, app: Game::ARTIST, page: 1

    assert_response :success

    # does not include the autosaved one
    assert_equal [@gallery_activity], assigns(:gallery_activities)
  end

  test "should show index with only apps" do
    get :index, app: Game::PLAYLAB, page: 1

    assert_response :success

    # does not include the autosaved one
    assert_equal [@playlab_gallery_activity], assigns(:gallery_activities)
  end

  test "annoying page number redirects to first page" do
    get :index, app: Game::PLAYLAB, page: 100000

    assert_redirected_to '/gallery'
  end

  test "should show index if gallery activity belongs to deleted user" do
    u = @playlab_gallery_activity.user
    u.destroy
    @playlab_gallery_activity.reload

    get :index, page: 1

    assert_response :success

    assert_equal [@gallery_activity], assigns(:artist_gallery_activities)

    assert_equal [@playlab_gallery_activity], assigns(:playlab_gallery_activities)
  end

  test "should show index with thousands of pictures with a delimiter in the count" do
    GalleryActivity.stubs(:pseudocount).returns(14320) # mock because actually creating takes forever

    # index is public
    get :index

    assert_response :success

    assert_select 'b', '14,320'
  end

  test "should show index to user" do
    sign_in @user
    get :index

    assert_response :success
  end

  test "user should create gallery_activity" do
    sign_in @user

    assert_difference('GalleryActivity.count') do
      post :create, gallery_activity: { activity_id: @new_activity.id }, format: :json
    end

    assert_equal @user, assigns(:gallery_activity).user
    assert_equal @new_activity, assigns(:gallery_activity).activity
    assert_equal false, assigns(:gallery_activity).autosaved
    assert_equal 'studio', assigns(:gallery_activity).app

    assert_response :created
  end

  test "should return existing gallery_activity if exists" do
    sign_in @user

    gallery_activity = GalleryActivity.create!(activity_id: @new_activity.id, user_id: @user.id)

    assert_no_difference('GalleryActivity.count') do
      post :create, gallery_activity: { activity_id: @new_activity.id }, format: :json
    end

    assert_equal gallery_activity, assigns(:gallery_activity)
    assert_equal false, assigns(:gallery_activity).autosaved

    assert_response :created
  end

  test "should destroy gallery_activity" do
    sign_in @user

    assert_difference('GalleryActivity.count', -1) do
      delete :destroy, id: @gallery_activity, format: :json
    end

    assert_response :no_content
  end

  test "cannot destroy someone else's gallery activity" do
    sign_in create(:user)

    assert_no_difference('GalleryActivity.count') do
      delete :destroy, id: @gallery_activity, format: :json
    end

    assert_response :forbidden
  end

  test "cannot create gallery activity for someone else" do
    sign_in another_user = create(:user)
    create :activity, user: another_user

    assert_no_difference('GalleryActivity.count') do
      post :create, gallery_activity: { activity_id: @new_activity.id, user_id: @user.id }, format: :json
    end

    assert_response :forbidden
  end

  test "cannot create gallery activity for someone else's gallery activity" do
    sign_in create(:user)

    assert_no_difference('GalleryActivity.count') do
      post :create, gallery_activity: { activity_id: @new_activity.id }, format: :json
    end

    assert_response :forbidden
  end

  test "cannot create gallery activity for invalid activity id" do
    sign_in create(:user)

    assert_no_difference('GalleryActivity.count') do
      post :create, gallery_activity: { activity_id: 222222 }, format: :json
    end

    assert_response :forbidden
  end

  test "cannot create gallery activity for invalid user id" do
    sign_in another_user = create(:user)
    activity = create :activity, user: another_user

    assert_no_difference('GalleryActivity.count') do
      post :create, gallery_activity: { activity_id: activity.id, user_id: 22222 }, format: :json
    end

    assert_response :forbidden
  end

  test "cannot create gallery activity with no user" do
    another_user = create(:user)
    activity = create :activity, user: another_user

    assert_no_difference('GalleryActivity.count') do
      post :create, gallery_activity: { activity_id: activity.id }, format: :json
    end

    assert_response 401
  end

  test "cannot create gallery activity with no activity id" do
    sign_in create(:user)

    assert_no_difference('GalleryActivity.count') do
      post :create, gallery_activity: { }, format: :json
    end

    assert_response :forbidden
  end

  test "does not create duplicate gallery activity" do
    sign_in @user

    assert_no_difference('GalleryActivity.count') do
      post :create, gallery_activity: { activity_id: @gallery_activity.activity_id }, format: :json
    end

    # pretend to succeed
    assert_response :created
  end

end
