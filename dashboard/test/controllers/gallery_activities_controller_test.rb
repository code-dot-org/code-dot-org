require 'test_helper'

class GalleryActivitiesControllerTest < ActionController::TestCase
  setup do
    @user = create(:user)
    sign_in @user

    @artist_level = create(:level, game: Game.find_by_app(Game::ARTIST))
    @artist_user_level = create(:user_level, user: @user, level: @artist_level)
    @artist_level_source = create(
      :level_source,
      :with_image,
      level: @artist_level
    )
    @gallery_activity = create(
      :gallery_activity,
      user: @user,
      level_source: @artist_level_source,
      autosaved: false,
      user_level: @artist_user_level
    )

    @playlab_level = create(:level, game: Game.find_by_app(Game::PLAYLAB))
    @playlab_user_level = create(:user_level, user: @user, level: @playlab_level)
    @playlab_level_source = create(
      :level_source,
      :with_image,
      level: @playlab_level
    )
    @playlab_gallery_activity = create(
      :gallery_activity,
      user: @user,
      level_source: @playlab_level_source,
      autosaved: false,
      user_level: @playlab_user_level
    )

    @new_level = create(:level, game: Game.find_by_app(Game::PLAYLAB))
    @autosaved_gallery_activity = create(:gallery_activity, user: @user, autosaved: true)
  end

  test "index works with empty gallery" do
    GalleryActivity.destroy_all

    get :index
    assert_response :success
  end

  test "should show index to non-signed-in user" do
    sign_out @user

    get :index

    assert_response :success
    # Does not include the autosaved one.
    assert_equal [@gallery_activity], assigns(:artist_gallery_activities)
    assert_equal [@playlab_gallery_activity], assigns(:playlab_gallery_activities)
  end

  test "should show index with only art to non-signed-in user" do
    sign_out @user

    get :index, params: {app: Game::ARTIST, page: 1}

    assert_response :success
    # Does not include the autosaved one.
    assert_equal [@gallery_activity], assigns(:gallery_activities)
  end

  test "should show index with only apps to non-signed-in user" do
    sign_out @user

    get :index, params: {app: Game::PLAYLAB, page: 1}

    assert_response :success
    assert_equal [@playlab_gallery_activity], assigns(:gallery_activities)
  end

  test "annoying page number redirects to first page for non-signed-in user" do
    sign_out @user

    get :index, params: {app: Game::PLAYLAB, page: 100000}

    assert_redirected_to '/gallery'
  end

  test "should show index if gallery activity belongs to hard-deleted user" do
    sign_out @user
    u = @playlab_gallery_activity.user
    u.destroy
    @playlab_gallery_activity.reload

    get :index, params: {page: 1}

    assert_response :success
    assert_equal [@gallery_activity], assigns(:artist_gallery_activities)
    assert_equal [@playlab_gallery_activity], assigns(:playlab_gallery_activities)
  end

  test "should show index with thousands of pictures with a delimiter in the count" do
    # Mock because actually creating takes forever.
    GalleryActivity.stubs(:pseudocount).returns(14320)

    get :index

    assert_response :success
    assert_select 'b', '14,320'
  end

  test "should show index to user" do
    get :index

    assert_response :success
  end

  test "user should create gallery_activity" do
    level_source = create :level_source, level: @new_level
    user_level = create :user_level, user: @user, level: @new_level

    assert_creates(GalleryActivity) do
      post :create,
        params: {
          gallery_activity: {
            level_source_id: level_source.id,
            user_level_id: user_level.id
          }
        },
        format: :json
    end

    assert_equal @user, assigns(:gallery_activity).user
    assert_equal user_level, assigns(:gallery_activity).user_level
    assert_equal level_source, assigns(:gallery_activity).level_source
    assert_equal false, assigns(:gallery_activity).autosaved
    assert_equal 'studio', assigns(:gallery_activity).app

    assert_response :created
  end

  test "should return existing gallery_activity if exists" do
    assert_does_not_create(GalleryActivity) do
      post :create,
        params: {
          gallery_activity: {
            level_source_id: @artist_level_source.id,
            user_id: @user.id,
            user_level_id: @artist_user_level.id
          }
        },
        format: :json
    end

    assert_response :created

    assert_equal @gallery_activity, assigns(:gallery_activity)
    assert_equal false, assigns(:gallery_activity).autosaved
  end

  test "should destroy gallery_activity" do
    assert_destroys(GalleryActivity) do
      delete :destroy, params: {id: @gallery_activity}, format: :json
    end

    assert_response :no_content
  end

  test "cannot destroy someone else's gallery activity" do
    sign_in create(:user)

    assert_does_not_create(GalleryActivity) do
      delete :destroy, params: {id: @gallery_activity}, format: :json
    end

    assert_response :forbidden
  end

  test "cannot create gallery activity for someone else's user_level" do
    other_user_level = create(
      :user_level,
      user: (create :user),
      level: @artist_level
    )

    assert_does_not_create(GalleryActivity) do
      post :create,
        params: {
          gallery_activity: {
            level_source_id: @artist_level_source.id,
            user_id: @user.id,
            user_level_id: other_user_level.id
          }
        },
        format: :json
    end

    assert_response :forbidden
  end

  test "cannot create gallery activity for someone else" do
    sign_in create(:user)
    level_source = create :level_source, level: @new_level
    user_level = create :user_level, user: @user, level: @new_level

    assert_does_not_create(GalleryActivity) do
      post :create,
        params: {
          gallery_activity: {
            level_source_id: level_source.id,
            user_level_id: user_level.id,
            user_id: @user.id
          }
        },
        format: :json
    end

    assert_response :forbidden
  end

  test "cannot create gallery activity for someone else's gallery activity" do
    sign_in create(:user)
    level_source = create :level_source, level: @new_level
    user_level = create :user_level, user: @user, level: @new_level

    assert_does_not_create(GalleryActivity) do
      post :create,
        params: {
          gallery_activity: {
            level_source_id: level_source.id,
            user_level_id: user_level.id
          }
        },
        format: :json
    end

    assert_response :forbidden
  end

  test "cannot create gallery activity for invalid user_level id" do
    assert_does_not_create(GalleryActivity) do
      post :create,
        params: {gallery_activity: {user_level_id: UserLevel.last.id + 1}},
        format: :json
    end

    assert_response :forbidden
  end

  test "cannot create gallery activity for invalid user id" do
    level_source = create :level_source, level: @new_level
    user_level = create :user_level, user: @user, level: @new_level

    assert_does_not_create(GalleryActivity) do
      post :create,
        params: {
          gallery_activity: {
            level_source_id: level_source.id,
            user_level_id: user_level.id,
            user_id: User.last.id + 1
          }
        },
        format: :json
    end

    assert_response :forbidden
  end

  test "cannot create gallery activity with no user_level id" do
    assert_does_not_create(GalleryActivity) do
      assert_raises(ActionController::ParameterMissing) do
        post :create, params: {gallery_activity: {stub: nil}}, format: :json
      end
    end
  end

  test "does not create duplicate gallery activity" do
    assert_does_not_create(GalleryActivity) do
      post :create,
        params: {
          gallery_activity: {
            level_source_id: @artist_level_source.id,
            user_level_id: @artist_user_level.id
          }
        },
        format: :json
    end

    # Despite no GalleryActivity being created, the response should be success.
    assert_response :created
  end
end
