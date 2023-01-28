require 'test_helper'
require 'cdo/aws/s3'

class ReportAbuseControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  def fixme_later
    # channels
    @storage = create(:project_storage)
    @storage_id = @storage.id
    @projects = Projects.new(@storage_id)
    @channel_id = @projects.create({}, ip: '10.0.0.1')
    @controller.stubs(:get_storage_id).returns(@storage_id)

    # files
    AWS::S3.stubs :create_client # Don't actually talk to S3
    FileBucket.any_instance.stubs(:list).returns([{filename: 'test.file'}])
  end

  def fixme_later_too
    @controller.unstub(:get_storage_id)

    FileBucket.any_instance.unstub(:list)
    FileBucket.any_instance.unstub(:get_abuse_score)
  end

  # channels

  test "post abuse score" do
    DASHBOARD_DB.transaction(rollback: :always) do
      fixme_later
      assert_equal 0, @controller.update_channel_abuse_score(@channel_id)
      fixme_later_too
    end
  end

  test "signed in abuse" do
    DASHBOARD_DB.transaction(rollback: :always) do
      fixme_later
      DCDO.stubs(:get).with('restrict-abuse-reporting-to-verified', true).returns(false)

      user = create(:student)
      sign_in user

      # check initial state
      assert_equal 0, Projects.get_abuse(@channel_id)

      # authenticated non-teacher should get a score of 10
      assert_equal 10, @controller.update_channel_abuse_score(@channel_id)
      assert_equal 10, Projects.get_abuse(@channel_id)

      DCDO.unstub(:get)
      fixme_later_too
    end
  end

  test "abuse frozen" do
    DASHBOARD_DB.transaction(rollback: :always) do
      fixme_later
      # freeze the project
      @projects.update(@channel_id, {frozen: true}, '10.0.0.1')

      # check initial state
      assert_equal 0, Projects.get_abuse(@channel_id)

      user = create(:student)
      sign_in user

      assert_equal 0, @controller.update_channel_abuse_score(@channel_id)
      assert_equal 0, Projects.get_abuse(@channel_id)
      fixme_later_too
    end
  end

  # files

  test "set abuse score" do
    DASHBOARD_DB.transaction(rollback: :always) do
      fixme_later
      FileBucket.any_instance.stubs(:get_abuse_score).returns(0)
      FileBucket.any_instance.expects(:replace_abuse_score).once
      @controller.update_file_abuse_score('files', 'test-channel-id', 10)
      fixme_later_too
    end
  end

  test "increment abuse score" do
    DASHBOARD_DB.transaction(rollback: :always) do
      fixme_later
      FileBucket.any_instance.stubs(:get_abuse_score).returns(10)
      FileBucket.any_instance.expects(:replace_abuse_score).once
      @controller.update_file_abuse_score('files', 'test-channel-id', 20)
      fixme_later_too
    end
  end

  test "set abuse score to be the same" do
    DASHBOARD_DB.transaction(rollback: :always) do
      fixme_later
      # set to be the same
      FileBucket.any_instance.stubs(:get_abuse_score).returns(20)
      FileBucket.any_instance.expects(:replace_abuse_score).once
      @controller.update_file_abuse_score('files', 'test-channel-id', 20)
      fixme_later_too
    end
  end

  test "non-permissions can't decrement" do
    DASHBOARD_DB.transaction(rollback: :always) do
      fixme_later
      FileBucket.any_instance.stubs(:get_abuse_score).returns(10)
      FileBucket.any_instance.expects(:replace_abuse_score).never
      @controller.update_file_abuse_score('files', 'test-channel-id', 0)
      fixme_later_too
    end
  end

  test "with permission can decrement" do
    DASHBOARD_DB.transaction(rollback: :always) do
      fixme_later
      user = create(:project_validator)
      sign_in user
      FileBucket.any_instance.stubs(:get_abuse_score).returns(10)
      FileBucket.any_instance.expects(:replace_abuse_score).once
      @controller.update_file_abuse_score('files', 'test-channel-id', 0)
      sign_out user
      fixme_later_too
    end
  end
end
