require_relative '../../test_helper'
require_relative '../../../middleware/helpers/firebase_helper'

class FirebaseHelperTest < Minitest::Test
  def setup
    CDO.stubs(:firebase_name).returns('firebase-name')
    CDO.stubs(:firebase_secret).returns('firebase-secret')
  end

  def test_constructs_with_channel_id
    FirebaseHelper.new 'fake-channel-name'
  end

  def test_delete_channel_with_nil_channel
    e = assert_raises do
      FirebaseHelper.delete_channel nil
    end
    assert_equal 'channel_id must be non-empty', e.message
  end

  def test_delete_channel_with_empty_channel
    e = assert_raises do
      FirebaseHelper.delete_channel ''
    end
    assert_equal 'channel_id must be non-empty', e.message
  end

  def test_delete_channel_with_fake_channel
    fake_channel_name = 'fake-channel-name'
    Firebase::Client.expects(:new).returns(stub(:delete, nil))
    FirebaseHelper.delete_channel fake_channel_name
  end
end
