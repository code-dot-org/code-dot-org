require 'test_helper'
require 'cdo/aws/s3'

class FilesApiControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    AWS::S3.stubs :create_client # Don't actually talk to S3
    FileBucket.any_instance.stubs(:list).returns([{filename: 'test.file'}])
  end

  test "set abuse score" do
    FileBucket.any_instance.stubs(:get_abuse_score).returns(0)
    FileBucket.any_instance.expects(:replace_abuse_score).once
    patch :update, params: {
      endpoint: 'files',
      abuse_score: 10,
      encrypted_channel_id: 'test'
    }
  end

  test "increment abuse score" do
    FileBucket.any_instance.stubs(:get_abuse_score).returns(10)
    FileBucket.any_instance.expects(:replace_abuse_score).once
    patch :update, params: {
      endpoint: 'files',
      abuse_score: 20,
      encrypted_channel_id: 'test'
    }
  end

  test "set abuse score to be the same" do
    # set to be the same
    FileBucket.any_instance.stubs(:get_abuse_score).returns(20)
    FileBucket.any_instance.expects(:replace_abuse_score).once
    patch :update, params: {
      endpoint: 'files',
      abuse_score: 20,
      encrypted_channel_id: 'test'
    }
  end

  test "non-permissions can't decrement" do
    FileBucket.any_instance.stubs(:get_abuse_score).returns(10)
    FileBucket.any_instance.expects(:replace_abuse_score).never
    patch :update, params: {
      endpoint: 'files',
      abuse_score: 0,
      encrypted_channel_id: 'test'
    }
  end

  test "with permission can decrement" do
    user = create(:project_validator)
    sign_in user
    FileBucket.any_instance.stubs(:get_abuse_score).returns(10)
    FileBucket.any_instance.expects(:replace_abuse_score).once
    patch :update, params: {
      endpoint: 'files',
      abuse_score: 0,
      encrypted_channel_id: 'test'
    }
  end
end
