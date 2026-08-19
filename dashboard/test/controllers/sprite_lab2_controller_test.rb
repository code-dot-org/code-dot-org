require 'test_helper'

class SpriteLab2ControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  FAKE_IP = '127.0.0.1'.freeze

  setup do
    @script = create(:script, :in_single_unit_course)
    # A script that is not part of a unit group, the /s/allthethings shape.
    @loose_script = create(:script)
    @level = create(:level)

    @teacher = create(:teacher)
    @student = create(:student)
    create(:follower, student_user: @student, user: @teacher)
    @student_storage_id = create_storage_id_for_user(@student.id)

    # Don't actually talk to S3 when running SourceBucket.new.
    AWS::S3.stubs :create_client
  end

  test "finds a section-mate's project created inside a unit" do
    stub_scenes channel_for(@student_storage_id, @script.id)

    sign_in @teacher
    get :section_scenes, params: {level_id: @level.id, script_id: @script.id}

    assert_response :success
    scenes = JSON.parse(response.body)['scenes']
    assert_equal 1, scenes.length
    assert_equal 'story-scene', scenes.first['sceneId']
    assert_equal 'Story', scenes.first['sceneName']
    assert_equal @student.name, scenes.first['ownerName']
  end

  # Playing the level outside any script must still see a project made inside
  # one. Scoping strictly to the requested script is what left the block's
  # dropdown empty in production.
  test 'finds a unit-scoped project when the request carries no script id' do
    stub_scenes channel_for(@student_storage_id, @script.id)

    sign_in @teacher
    get :section_scenes, params: {level_id: @level.id}

    assert_response :success
    assert_equal 1, JSON.parse(response.body)['scenes'].length
  end

  # The same level in a script that is not in a unit group, reached while
  # playing it in one that is.
  test 'finds a project made through a different script' do
    stub_scenes channel_for(@student_storage_id, @loose_script.id)

    sign_in @teacher
    get :section_scenes, params: {level_id: @level.id, script_id: @script.id}

    assert_response :success
    assert_equal 1, JSON.parse(response.body)['scenes'].length
  end

  # With a project in each, the one for the script being played wins, so a
  # classmate's unrelated project elsewhere doesn't shadow the relevant one.
  test 'prefers the project for the script being played' do
    wanted = channel_for(@student_storage_id, @script.id)
    other = channel_for(@student_storage_id, @loose_script.id)
    stub_scenes wanted, scene_id: 'wanted-scene'
    stub_scenes other, scene_id: 'other-scene'

    sign_in @teacher
    get :section_scenes, params: {level_id: @level.id, script_id: @script.id}

    assert_response :success
    scenes = JSON.parse(response.body)['scenes']
    assert_equal(['wanted-scene'], scenes.map {|scene| scene['sceneId']})
  end

  # Channels predating the script_id column have a null one; passing a script id
  # must still find them.
  test 'finds a project created outside any unit' do
    stub_scenes channel_for(@student_storage_id, nil)

    sign_in @teacher
    get :section_scenes, params: {level_id: @level.id, script_id: @script.id}

    assert_response :success
    assert_equal 1, JSON.parse(response.body)['scenes'].length
  end

  # Hitting /levels/[id] directly while developing, for a project made the same
  # way: no script at either end.
  test 'finds a script-less project with no script id in the request' do
    stub_scenes channel_for(@student_storage_id, nil)

    sign_in @teacher
    get :section_scenes, params: {level_id: @level.id}

    assert_response :success
    assert_equal 1, JSON.parse(response.body)['scenes'].length
  end

  test 'excludes someone who shares no section' do
    stranger = create(:student)
    stub_scenes channel_for(create_storage_id_for_user(stranger.id), @script.id)

    sign_in @teacher
    get :section_scenes, params: {level_id: @level.id, script_id: @script.id}

    assert_response :success
    assert_empty JSON.parse(response.body)['scenes']
  end

  private def channel_for(storage_id, script_id)
    ChannelToken.find_or_create_channel_token(
      @level, FAKE_IP, storage_id, script_id
    ).channel
  end

  private def stub_scenes(channel, scene_id: 'story-scene')
    body = {scenes: [{id: scene_id, name: 'Story'}]}.to_json
    SourceBucket.any_instance.stubs(:get).with(channel, 'main.json').returns(
      {
        status: 'FOUND',
        body: StringIO.new(body),
        version_id: 'fake-version-id',
        last_modified: DateTime.now,
      }
    )
  end
end
