require 'test_helper'
require 'cdo/aws/s3'

class ReportAbuseControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    # channels
    # Use a fake storage ID, because if you use the project_storage factory,
    # everything breaks.
    storage_id = 1
    @projects = Projects.new(storage_id)
    @channel_id = @projects.create({}, ip: '10.0.0.1')
    @controller.stubs(:get_storage_id).returns(@storage_id)

    # files
    AWS::S3.stubs :create_client # Don't actually talk to S3
    FileBucket.any_instance.stubs(:list).returns([{filename: 'test.file'}])
  end

  teardown do
    @controller.unstub(:get_storage_id)

    FileBucket.any_instance.unstub(:list)
    FileBucket.any_instance.unstub(:get_abuse_score)
  end

  # channels

  test "update abuse score" do
    assert_equal 0, @controller.update_channel_abuse_score(@channel_id)
  end

  test "signed in update abuse score" do
    DCDO.stubs(:get).with('restrict-abuse-reporting-to-verified', true).returns(false)

    user = create(:student)
    sign_in user

    # check initial state
    assert_equal 0, Projects.get_abuse(@channel_id)

    # authenticated non-teacher should get a score of 10
    assert_equal 10, @controller.update_channel_abuse_score(@channel_id)
    assert_equal 10, Projects.get_abuse(@channel_id)

    DCDO.unstub(:get)
  end

  test "abuse frozen" do
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
    assert response.unauthorized?

    user = create(:project_validator)
    sign_in user

    response = get :show_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 0, JSON.parse(response.body)['abuse_score']
  end

  test "delete abuse score" do
    user = create(:project_validator)
    sign_in user

    response = get :show_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 0, JSON.parse(response.body)['abuse_score']

    sign_out user

    response = delete :destroy_abuse, params: {channel_id: @channel_id}
    assert response.unauthorized?

    sign_in user

    response = delete :destroy_abuse, params: {channel_id: @channel_id}
    assert response.ok?
    assert_equal 0, JSON.parse(response.body)['abuse_score']
  end

  test "base64 error" do
    causes_argumenterror = "bT0zAyBvk"
    causes_ciphererror = "IMALITTLETEAPOTSHORTANDSTOUT"

    user = create(:project_validator)
    sign_in user

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
