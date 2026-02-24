require 'test_helper'
require 'cdo/aws/s3'

class ReportAbuseControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    # channels
    # Use a fake storage ID, because if you use the project_storage factory,
    # many other tests (e.g. ProjectsController) break.
    storage_id = 1
    @projects = Projects.new(storage_id)
    @channel_id = @projects.create({}, ip: '10.0.0.1')
    @controller.stubs(:get_storage_id).returns(@storage_id)

    # files
    AWS::S3.stubs :create_client # Don't actually talk to S3
    FileBucket.any_instance.stubs(:list).returns([{filename: 'test.file'}])
    AssetBucket.any_instance.stubs(:list).returns([{filename: 'test.asset'}])
    SourceBucket.any_instance.stubs(:list).returns([{filename: 'main.json'}])
    AnimationBucket.any_instance.stubs(:list).returns([{filename: 'test.animation'}])
    LibraryBucket.any_instance.stubs(:list).returns([{filename: 'test.library'}])
  end

  teardown do
    @controller.unstub(:get_storage_id)

    FileBucket.any_instance.unstub(:list)
    FileBucket.any_instance.unstub(:get_abuse_score)
    AssetBucket.any_instance.unstub(:list)
    AssetBucket.any_instance.unstub(:get_abuse_score)
    SourceBucket.any_instance.unstub(:list)
    SourceBucket.any_instance.unstub(:get_abuse_score)
    AnimationBucket.any_instance.unstub(:list)
    AnimationBucket.any_instance.unstub(:get_abuse_score)
    LibraryBucket.any_instance.unstub(:list)
    LibraryBucket.any_instance.unstub(:get_abuse_score)
  end

  # channels

  test "signed out user does not update abuse score" do
    assert_equal 0, @controller.update_channel_abuse_score(@channel_id)
  end

  test "signed in user can update abuse score when reporting not restricted to verified teachers" do
    @controller.stubs(:restrict_reporting_to_verified_teachers).returns(false)
    DCDO.stubs(:get).with('restrict_reporting_to_verified_teachers', false).returns(false)
    DCDO.stubs(:get).with('migration_service_enabled', false).returns(false)

    user = create(:student)
    sign_in user

    # Check initial state.
    assert_equal 0, Projects.get_abuse(@channel_id)

    # Authenticated non-teacher should get a score of 10.
    assert_equal 10, @controller.update_channel_abuse_score(@channel_id)
    assert_equal 10, Projects.get_abuse(@channel_id)
  end

  test "signed in student can't update abuse score reporting restricted to verified teachers" do
    @controller.stubs(:restrict_reporting_to_verified_teachers).returns(true)

    user = create(:student)
    sign_in user

    # Check initial state.
    assert_equal 0, Projects.get_abuse(@channel_id)

    # Authenticated student should get a score of 0 when reporting is restricted to verified teachers.
    assert_equal 0, @controller.update_channel_abuse_score(@channel_id)
    assert_equal 0, Projects.get_abuse(@channel_id)
  end

  test "verified teacher can update abuse score when reporting restricted to verified teacher users" do
    user = create(:authorized_teacher)
    sign_in user

    @controller.stubs(:restrict_reporting_to_verified_teachers).returns(true)

    # check initial state
    assert_equal 0, Projects.get_abuse(@channel_id)

    # authenticated verified teacher should get a score of 20
    assert_equal 20, @controller.update_channel_abuse_score(@channel_id)
    assert_equal 20, Projects.get_abuse(@channel_id)
  end

  test "signed in user can't update abuse score when channel is frozen" do
    # freeze the project
    @projects.update(@channel_id, {frozen: true}, '10.0.0.1')

    # check initial state
    assert_equal 0, Projects.get_abuse(@channel_id)

    user = create(:student)
    sign_in user

    assert_equal 0, @controller.update_channel_abuse_score(@channel_id)
    assert_equal 0, Projects.get_abuse(@channel_id)
  end

  test "get abuse score" do
    response = get :show_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 0, JSON.parse(response.body)['abuse_score']
  end

  test "can't reset abuse score as signed-out user" do
    response = get :show_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 0, JSON.parse(response.body)['abuse_score']

    response = delete :reset_abuse, params: {channel_id: @channel_id}
    assert response.unauthorized?
  end

  test "can't reset abuse score as student user" do
    response = get :show_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 0, JSON.parse(response.body)['abuse_score']

    user = create(:student)
    sign_in user

    response = delete :reset_abuse, params: {channel_id: @channel_id}
    assert response.unauthorized?
  end

  test "can reset abuse score as project_validator" do
    # Set initial abuse score to 20.
    @projects.increment_abuse(@channel_id, 20)
    response = get :show_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 20, JSON.parse(response.body)['abuse_score']

    user = create(:project_validator)
    sign_in user

    # Verify that file abuse scores are reset to 0 for all bucket types.
    AssetBucket.any_instance.stubs(:get_abuse_score).returns(20)
    AssetBucket.any_instance.expects(:replace_abuse_score).with(@channel_id, 'test.asset', 0).once
    FileBucket.any_instance.stubs(:get_abuse_score).returns(20)
    FileBucket.any_instance.expects(:replace_abuse_score).with(@channel_id, 'test.file', 0).once
    LibraryBucket.any_instance.stubs(:get_abuse_score).returns(20)
    LibraryBucket.any_instance.expects(:replace_abuse_score).with(@channel_id, 'test.library', 0).once
    SourceBucket.any_instance.stubs(:get_abuse_score).returns(20)
    SourceBucket.any_instance.expects(:replace_abuse_score).with(@channel_id, 'main.json', 0).once
    AnimationBucket.any_instance.stubs(:get_abuse_score).returns(20)
    AnimationBucket.any_instance.expects(:replace_abuse_score).with(@channel_id, 'test.animation', 0).once

    response = delete :reset_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 0, JSON.parse(response.body)['abuse_score']
  end

  test "update_abuse_image_moderation flags and updates abuse score for signed in user" do
    user = create(:student)
    sign_in user

    # Ensure initial score is 0.
    assert_equal 0, Projects.get_abuse(@channel_id)

    post :update_abuse_image_moderation, params: {channel_id: @channel_id, type: 'flag'}

    assert response.ok?
    assert_equal 15, JSON.parse(response.body)["abuse_score"]
    assert_equal 15, Projects.get_abuse(@channel_id)
  end

  test "update_abuse_image_moderation unflags and updates abuse score for signed in user" do
    user = create(:student)
    sign_in user

    # Set initial score to 15.
    @projects.increment_abuse(@channel_id, 15)
    assert_equal 15, Projects.get_abuse(@channel_id)

    post :update_abuse_image_moderation, params: {channel_id: @channel_id, type: 'unflag'}

    assert response.ok?
    assert_equal 0, JSON.parse(response.body)["abuse_score"]
    assert_equal 0, Projects.get_abuse(@channel_id)
  end

  test "update_abuse_image_moderation requires login" do
    post :update_abuse_image_moderation, params: {channel_id: @channel_id, type: 'flag'}

    assert_response :unauthorized
  end

  test "update_abuse_image_moderation raises bad request on bad channel_id" do
    user = create(:student)
    sign_in user

    assert_raises(ActionController::BadRequest) do
      post :update_abuse_image_moderation, params: {channel_id: "invalid-channel", type: 'flag'}
    end
  end

  test "update_abuse_image_moderation with invalid type returns bad request" do
    user = create(:student)
    sign_in user

    # Ensure initial score is 0
    assert_equal 0, Projects.get_abuse(@channel_id)

    post :update_abuse_image_moderation, params: {channel_id: @channel_id, type: 'invalid_type'}

    assert_response :bad_request
    json = JSON.parse(response.body)
    assert_equal "Invalid type parameter. Must be 'flag' or 'unflag'.", json["error"]

    # Ensure abuse score was not changed
    assert_equal 0, Projects.get_abuse(@channel_id)
  end

  test "base64 error" do
    causes_argumenterror = "bT0zAyBvk"
    causes_ciphererror = "IMALITTLETEAPOTSHORTANDSTOUT"

    assert_raises(ActionController::BadRequest) do
      get :show_abuse, params: {channel_id: causes_argumenterror}
    end

    assert_raises(ActionController::BadRequest) do
      get :show_abuse, params: {channel_id: causes_ciphererror}
    end
  end

  # files

  test "set abuse score" do
    FileBucket.any_instance.stubs(:get_abuse_score).returns(0)
    FileBucket.any_instance.expects(:replace_abuse_score).once
    @controller.update_file_abuse_score('files', 'test-channel-id', 10)
  end

  test "increment abuse score" do
    FileBucket.any_instance.stubs(:get_abuse_score).returns(10)
    FileBucket.any_instance.expects(:replace_abuse_score).once
    @controller.update_file_abuse_score('files', 'test-channel-id', 20)
  end

  test "set abuse score to be the same" do
    # set to be the same
    FileBucket.any_instance.stubs(:get_abuse_score).returns(20)
    FileBucket.any_instance.expects(:replace_abuse_score).once
    @controller.update_file_abuse_score('files', 'test-channel-id', 20)
  end

  test "non-permissions can't decrement" do
    FileBucket.any_instance.stubs(:get_abuse_score).returns(10)
    FileBucket.any_instance.expects(:replace_abuse_score).never
    @controller.update_file_abuse_score('files', 'test-channel-id', 0)
  end

  test "with permission can decrement" do
    user = create(:project_validator)
    sign_in user
    FileBucket.any_instance.stubs(:get_abuse_score).returns(10)
    FileBucket.any_instance.expects(:replace_abuse_score).once
    @controller.update_file_abuse_score('files', 'test-channel-id', 0)
    sign_out user
  end
end
