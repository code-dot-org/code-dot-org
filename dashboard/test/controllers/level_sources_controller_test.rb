require 'test_helper'

class LevelSourcesControllerTest < ActionController::TestCase
  setup do
    @admin = create(:admin)
    @level_source = create(:level_source)
    @hidden_level_source = create(:level_source, hidden: true)
  end

  test "should get edit" do
    get :edit, id: @level_source.id
    assert_response :success
    assert_equal([], assigns(:callouts))
  end

  test "should not get edit if hidden" do
    assert_raises(ActiveRecord::RecordNotFound) do
      get :edit, id: @hidden_level_source.id
    end
  end

  test "should get show" do
    get :show, id: @level_source.id
    assert_response :success
    assert_equal([], assigns(:callouts))
  end

  test "should get show with embed" do
    get :show, id: @level_source.id, embed: '1'
    assert_response :success
    assert_equal([], assigns(:callouts))
    
    assert_equal true, assigns(:embed)
    assert_equal false, assigns(:share)
    assert_equal true, assigns(:no_padding)
    assert_equal true, assigns(:skip_instructions_popup)
  end

  test "should not get show if hidden" do
    assert_raises(ActiveRecord::RecordNotFound) do
      get :show, id: @hidden_level_source.id
    end
  end

  test "should get show if hidden and admin" do
    sign_in @admin
    get :show, id: @hidden_level_source.id
    assert_response :success
  end

  test "should update if admin" do
    sign_in @admin
    patch :update, level_source: {hidden: true}, id: @level_source

    assert_redirected_to @level_source
    assert @level_source.reload.hidden?
  end

  test "update deletes gallery activities" do
    sign_in @admin

    create :gallery_activity, activity: create(:activity, level: @level_source.level)
    create :gallery_activity, activity: create(:activity, level: @level_source.level)

    assert_difference('GalleryActivity.count', -2) do # delete both above
      patch :update, level_source: {hidden: true}, id: @level_source
    end

    assert_redirected_to @level_source
    assert @level_source.reload.hidden?
  end

  test "should not update if not admin" do
    sign_in create(:user)
    patch :update, level_source: {hidden: true}, id: @level_source

    assert_response :forbidden
  end

  test 'routing' do
    assert_routing({ path: '/c/1', method: :get },
                   { controller: 'level_sources', action: 'show', id: '1' })
    assert_routing({ path: '/c/1/edit', method: :get },
                   { controller: 'level_sources', action: 'edit', id: '1' })
    assert_routing({ path: '/c/1/original_image', method: :get }, 
                   {controller: 'level_sources', action: 'original_image', id: '1' })
    assert_routing({ path: '/c/1/generate_image', method: :get },
                   { controller: 'level_sources', action: 'generate_image', id: '1' })
  end

  def expect_s3_upload
    CDO.disable_s3_image_uploads = false
    AWS::S3.expects(:upload_to_bucket).returns(true).twice
  end

  test "generate image for artist from db" do
    artist_level = create :level, game: create(:game, app: Game::ARTIST)
    level_source = create :level_source, level: artist_level
    level_source_image = create :level_source_image, level_source: level_source
    
    expect_s3_upload

    get :generate_image, id: level_source.id

    assert_redirected_to level_source_image.s3_framed_url
  end

  test "generate image for artist in s3" do
    artist_level = create :level, game: create(:game, app: Game::ARTIST)
    level_source = create :level_source, level: artist_level
    level_source_image = create :level_source_image, level_source: level_source, image: 'S3'
    
    get :generate_image, id: level_source.id

    assert_redirected_to level_source_image.s3_framed_url
  end

  test "original image for artist" do
    artist_level = create :level, game: create(:game, app: Game::ARTIST)
    level_source = create :level_source, level: artist_level
    level_source_image = create :level_source_image, level_source: level_source

    expect_s3_upload

    get :original_image, id: level_source.id

    assert_redirected_to level_source_image.s3_url
  end

  test "original image for artist in s3" do
    artist_level = create :level, game: create(:game, app: Game::ARTIST)
    level_source = create :level_source, level: artist_level
    level_source_image = create :level_source_image, level_source: level_source, image: 'S3'
    
    get :original_image, id: level_source.id

    assert_redirected_to level_source_image.s3_url
  end

  test "generate image for playlab" do
    playlab_level = create :level, game: create(:game, app: Game::PLAYLAB)
    level_source = create :level_source, level: playlab_level
    level_source_image = create :level_source_image, level_source: level_source

    expect_s3_upload

    get :generate_image, id: level_source.id

    assert_redirected_to level_source_image.s3_url
  end

  test "generate image for playlab in s3" do
    playlab_level = create :level, game: create(:game, app: Game::PLAYLAB)
    level_source = create :level_source, level: playlab_level
    level_source_image = create :level_source_image, level_source: level_source, image: 'S3'

    get :generate_image, id: level_source.id

    assert_redirected_to level_source_image.s3_url
  end

  test "generate image 404 for hidden level_sources" do
    artist_level = create :level, game: create(:game, app: Game::PLAYLAB)
    level_source = create :level_source, level: artist_level, hidden: true
    create :level_source_image, level_source: level_source

    assert_raises(ActiveRecord::RecordNotFound) do
      get :generate_image, id: level_source.id
    end
  end

  test "cache headers for generate image" do
    level = create :level, game: create(:game, app: Game::PLAYLAB)
    level_source = create :level_source, level: level
    create :level_source_image, level_source: level_source

    get :generate_image, id: level_source.id

    assert_equal "max-age=36000, public", response.headers["Cache-Control"]
  end

  test "cache headers for original image" do
    level = create :level, game: create(:game, app: Game::PLAYLAB)
    level_source = create :level_source, level: level
    create :level_source_image, level_source: level_source

    get :original_image, id: level_source.id

    assert_equal "max-age=36000, public", response.headers["Cache-Control"]
  end
end
