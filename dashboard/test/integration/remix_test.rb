require 'test_helper'

# Uncomment to test locally with similar constraints to what we see in the test environment
# Don't check in uncommented - this is leaky and affects other tests!
# require 'webmock/minitest'
# WebMock.disable_net_connect!

class RemixTest < ActionDispatch::IntegrationTest
  PROJECT_EDIT_REGEX = /#{'/projects/'}(?<project_type>\w+)\/(?<channel_id>[^\\]*)#{'/edit'}$/

  def setup
    AWS::S3.stubs :create_client # Don't actually talk to S3
    sign_in create :student
  end

  test 'artist only remixes Sources bucket' do
    assert_only_remixes_sources 'artist'
  end

  test 'artist_k1 only remixes Sources bucket' do
    assert_only_remixes_sources 'artist_k1'
  end

  test 'frozen only remixes Sources bucket' do
    assert_only_remixes_sources 'frozen'
  end

  test 'playlab only remixes Sources bucket' do
    assert_only_remixes_sources 'playlab'
  end

  test 'playlab_k1 only remixes Sources bucket' do
    assert_only_remixes_sources 'playlab_k1'
  end

  test 'starwars only remixes Sources bucket' do
    assert_only_remixes_sources 'starwars'
  end

  test 'starwarsblocks only remixes Sources bucket' do
    assert_only_remixes_sources 'starwarsblocks'
  end

  test 'starwarsblocks_hour only remixes Sources bucket' do
    assert_only_remixes_sources 'starwarsblocks_hour'
  end

  test 'iceage only remixes Sources bucket' do
    assert_only_remixes_sources 'iceage'
  end

  test 'infinity only remixes Sources bucket' do
    assert_only_remixes_sources 'infinity'
  end

  test 'gumball only remixes Sources bucket' do
    assert_only_remixes_sources 'gumball'
  end

  test 'flappy only remixes Sources bucket' do
    assert_only_remixes_sources 'flappy'
  end

  test 'minecraft_codebuilder only remixes Sources bucket' do
    assert_only_remixes_sources 'minecraft_codebuilder'
  end

  test 'minecraft_adventurer only remixes Sources bucket' do
    assert_only_remixes_sources 'minecraft_adventurer'
  end

  test 'minecraft_designer only remixes Sources bucket' do
    assert_only_remixes_sources 'minecraft_designer'
  end

  test 'minecraft_hero only remixes Sources bucket' do
    assert_only_remixes_sources 'minecraft_hero'
  end

  test 'applab only remixes Sources and Assets buckets and Starter assets' do
    assert_only_remixes_sources_assets_starter_assets 'applab'
  end

  test 'gamelab only remixes Sources, Assets and Animations buckets' do
    assert_only_remixes_sources_assets_animations 'gamelab'
  end

  test 'spritelab only remixes Sources, Assets and Animations buckets' do
    stub_project_body false
    assert_only_remixes_sources_assets_animations 'spritelab'
    unstub_project_body
  end

  test 'spritelab returns forbidden if in restricted share mode' do
    stub_project_body true
    assert_forbidden 'spritelab'
    unstub_project_body
  end

  test 'makerlab only remixes Sources and Assets buckets' do
    assert_only_remixes_sources_assets 'makerlab'
  end

  test 'weblab only remixes Sources and Files buckets' do
    assert_only_remixes_sources_files 'weblab'
  end

  test 'bounce only remixes Sources bucket' do
    assert_only_remixes_sources 'bounce'
  end

  test 'sports only remixes Sources bucket' do
    assert_only_remixes_sources 'sports'
  end

  test 'basketball only remixes Sources bucket' do
    assert_only_remixes_sources 'basketball'
  end

  test 'algebra_game only remixes Sources bucket' do
    assert_only_remixes_sources 'algebra_game'
  end

  test 'javalab only remixes Sources and Assets buckets, and Starter assets' do
    assert_only_remixes_sources_assets_starter_assets 'javalab'
  end

  def assert_only_remixes_sources(project_type)
    stub_project_level project_type
    original_channel_id = create_a_new_project project_type

    SourceBucket.any_instance.expects(:remix_source)

    AssetBucket.any_instance.expects(:copy_files).never
    AssetBucket.any_instance.expects(:copy_level_starter_assets).never
    AnimationBucket.any_instance.expects(:copy_files).never
    FileBucket.any_instance.expects(:copy_files).never

    new_channel_id = remix_a_project project_type, original_channel_id
    refute_equal original_channel_id, new_channel_id
  end

  def assert_only_remixes_sources_assets(project_type)
    stub_project_level project_type
    original_channel_id = create_a_new_project project_type

    SourceBucket.any_instance.expects(:remix_source)
    AssetBucket.any_instance.expects(:copy_files)

    AssetBucket.any_instance.expects(:copy_level_starter_assets).never
    AnimationBucket.any_instance.expects(:copy_files).never
    FileBucket.any_instance.expects(:copy_files).never

    new_channel_id = remix_a_project project_type, original_channel_id
    refute_equal original_channel_id, new_channel_id
  end

  def assert_only_remixes_sources_assets_animations(project_type)
    stub_project_level project_type
    original_channel_id = create_a_new_project project_type

    SourceBucket.any_instance.expects(:remix_source)
    AssetBucket.any_instance.expects(:copy_files)
    AnimationBucket.any_instance.expects(:copy_files).returns([])

    AssetBucket.any_instance.expects(:copy_level_starter_assets).never
    FileBucket.any_instance.expects(:copy_files).never

    new_channel_id = remix_a_project project_type, original_channel_id
    refute_equal original_channel_id, new_channel_id
  end

  def assert_only_remixes_sources_files(project_type)
    stub_project_level project_type
    original_channel_id = create_a_new_project project_type

    SourceBucket.any_instance.expects(:remix_source)
    FileBucket.any_instance.expects(:copy_files)

    AssetBucket.any_instance.expects(:copy_files).never
    AssetBucket.any_instance.expects(:copy_level_starter_assets).never
    AnimationBucket.any_instance.expects(:copy_files).never

    new_channel_id = remix_a_project project_type, original_channel_id
    refute_equal original_channel_id, new_channel_id
  end

  def assert_only_remixes_sources_assets_starter_assets(project_type)
    stub_project_level project_type
    original_channel_id = create_a_new_project project_type

    SourceBucket.any_instance.expects(:remix_source)
    AssetBucket.any_instance.expects(:copy_files)
    AssetBucket.any_instance.expects(:copy_level_starter_assets)

    AnimationBucket.any_instance.expects(:copy_files).never
    FileBucket.any_instance.expects(:copy_files).never

    new_channel_id = remix_a_project project_type, original_channel_id
    refute_equal original_channel_id, new_channel_id
  end

  def assert_forbidden(project_type)
    stub_project_level project_type
    original_channel_id = create_a_new_project project_type

    get "/projects/#{project_type}/#{original_channel_id}/remix"
    assert_response :forbidden
  end

  private def stub_project_level(type)
    factory = FactoryBot.factories.registered?(type) ? type : :level
    level = FactoryBot.create(factory)
    ProjectsController.any_instance.stubs(:get_from_cache).returns(level)
  end

  # @return [String] encrypted channel id of new project
  private def create_a_new_project(type)
    get "/projects/#{type}/new"
    assert_response :redirect, "Wrong response: #{response.body}"
    project_type, channel_id, action = unpack response.headers['Location']
    assert_equal type, project_type
    refute_nil channel_id
    assert_equal 'edit', action
    follow_redirect!
    assert_response :success, "Wrong response: #{response.body}"
    channel_id
  end

  # @return [String] encrypted channel id of new project
  private def remix_a_project(type, channel_id)
    get "/projects/#{type}/#{channel_id}/remix"
    assert_response :redirect, "Wrong response: #{response.body}"
    project_type, new_channel_id, action = unpack response.headers['Location']
    assert_equal type, project_type
    refute_nil new_channel_id
    assert_equal 'edit', action
    follow_redirect!
    assert_response :success, "Wrong response: #{response.body}"
    new_channel_id
  end

  private def unpack(location)
    /\/projects\/(?<project_type>\w+)\/(?<channel_id>[^\\]*)\/(?<action>\w+)$/ =~ location
    [project_type, channel_id, action]
  end

  private def stub_project_body(should_restrict_share)
    sample_project = StringIO.new
    sample_project.puts "{\"inRestrictedShareMode\": #{should_restrict_share}}"
    SourceBucket.any_instance.stubs(:get).returns({body: sample_project})
  end

  private def unstub_project_body
    SourceBucket.any_instance.unstub(:get)
  end
end
