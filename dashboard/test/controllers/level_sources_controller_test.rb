require 'test_helper'

class LevelSourcesControllerTest < ActionController::TestCase
  setup do
    @admin = create(:admin)
    @level_source = create(:level_source)
    @hidden_level_source = create(:level_source, hidden: true)
  end

  test "should get edit" do
    get :edit, params: {id: @level_source.id}
    assert_response :success
    assert_equal([], assigns(:view_options)[:callouts])
  end

  test "should not get edit if hidden" do
    assert_raises(ActiveRecord::RecordNotFound) do
      get :edit, params: {id: @hidden_level_source.id}
    end
  end

  test "should get show" do
    get :show, params: {id: @level_source.id}
    assert_response :success
    assert_equal([], assigns(:view_options)[:callouts])
  end

  test "should get show with encrypted level source ID" do
    skip "CDO.properties_encryption_key is not defined" unless CDO.properties_encryption_key
    encrypted = @level_source.encrypt_level_source_id @admin.id
    get :show, params: {level_source_id_and_user_id: encrypted}
    assert_response :success
    assert_equal @level_source, assigns(:level_source)
  end

  test "should get show with embed" do
    get :show, params: {id: @level_source.id, embed: '1'}
    assert_response :success

    app_options = assigns(:view_options)
    assert_equal true, app_options[:no_header]
    assert_equal true, app_options[:no_footer]
    assert_equal true, app_options[:white_background]
    assert_equal [], app_options[:callouts]

    options = assigns(:level_view_options_map)[@level_source.level_id]
    assert_equal true, options[:embed]
    assert_equal false, options[:share]
    assert_equal true, options[:skip_instructions_popup]
  end

  test "should not get show if hidden" do
    assert_raises(ActiveRecord::RecordNotFound) do
      get :show, params: {id: @hidden_level_source.id}
    end
  end

  test "should get show if hidden and we have project validator permission" do
    user = create(:teacher)
    user.permission = UserPermission::PROJECT_VALIDATOR
    sign_in user
    get :show, params: {id: @hidden_level_source.id}
    assert_response :success
  end

  test "should update if we have project validator permission" do
    user = create(:teacher)
    user.permission = UserPermission::PROJECT_VALIDATOR
    sign_in user
    patch :update, params: {level_source: {hidden: true}, id: @level_source}

    assert_redirected_to @level_source
    assert @level_source.reload.hidden?
  end

  test "should not update if we do not have block share permission" do
    sign_in create(:user)
    patch :update, params: {level_source: {hidden: true}, id: @level_source}

    assert_response :forbidden
  end

  test 'routing' do
    assert_routing(
      {path: '/c/1', method: :get},
      {controller: 'level_sources', action: 'show', id: '1'}
    )
    assert_routing(
      {path: '/c/1/edit', method: :get},
      {controller: 'level_sources', action: 'edit', id: '1'}
    )
    assert_routing(
      {path: '/c/1/original_image', method: :get},
      {controller: 'level_sources', action: 'original_image', id: '1'}
    )
    assert_routing(
      {path: '/c/1/generate_image', method: :get},
      {controller: 'level_sources', action: 'generate_image', id: '1'}
    )
  end

  def expect_s3_upload
    CDO.stubs(disable_s3_image_uploads: false)
    AWS::S3.expects(:upload_to_bucket).returns(true).twice
  end

  test "generate image for artist in s3" do
    artist_level = create :level, game: create(:game, app: Game::ARTIST)
    level_source = create :level_source, level: artist_level
    level_source_image = create :level_source_image, level_source: level_source, image: 'S3'

    get :generate_image, params: {id: level_source.id}

    assert_redirected_to level_source_image.s3_framed_url
  end

  test "original image for artist in s3" do
    artist_level = create :level, game: create(:game, app: Game::ARTIST)
    level_source = create :level_source, level: artist_level
    level_source_image = create :level_source_image, level_source: level_source, image: 'S3'

    get :original_image, params: {id: level_source.id}

    assert_redirected_to level_source_image.s3_url
  end

  test "generate image for playlab in s3" do
    playlab_level = create :level, game: create(:game, app: Game::PLAYLAB)
    level_source = create :level_source, level: playlab_level
    level_source_image = create :level_source_image, level_source: level_source, image: 'S3'

    get :generate_image, params: {id: level_source.id}

    assert_redirected_to level_source_image.s3_url
  end

  test "generate image 404 for hidden level_sources" do
    artist_level = create :level, game: create(:game, app: Game::PLAYLAB)
    level_source = create :level_source, level: artist_level, hidden: true
    create :level_source_image, level_source: level_source

    assert_raises(ActiveRecord::RecordNotFound) do
      get :generate_image, params: {id: level_source.id}
    end
  end

  test "cache headers for generate image" do
    level = create :level, game: create(:game, app: Game::PLAYLAB)
    level_source = create :level_source, level: level
    create :level_source_image, level_source: level_source

    get :generate_image, params: {id: level_source.id}

    assert_equal "max-age=36000, public", response.headers["Cache-Control"]
  end

  test "cache headers for original image" do
    level = create :level, game: create(:game, app: Game::PLAYLAB)
    level_source = create :level_source, level: level
    create :level_source_image, level_source: level_source

    get :original_image, params: {id: level_source.id}

    assert_equal "max-age=36000, public", response.headers["Cache-Control"]
  end

  test 'artist levelsource has sharing meta tags' do
    level_source = create(:level_source, level: Artist.first)
    get :show, params: {id: level_source.id}

    assert_response :success
    assert_sharing_meta_tags(
      url: "http://test.host/c/#{level_source.id}",
      image: 'http://test.host/assets/sharing_drawing.png',
      image_width: 400,
      image_height: 400,
      small_thumbnail: true
    )
  end

  test 'playlab levelsource has sharing meta tags' do
    level_source = create(:level_source, level: Studio.first)
    get :show, params: {id: level_source.id}

    assert_response :success

    assert_sharing_meta_tags(
      url: "http://test.host/c/#{level_source.id}",
      image: 'http://test.host/assets/sharing_drawing.png',
      image_width: 400,
      image_height: 400,
      apple_mobile_web_app: true
    )
  end
end
