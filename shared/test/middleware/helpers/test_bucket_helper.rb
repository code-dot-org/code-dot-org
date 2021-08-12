require_relative '../../test_helper'
require_relative '../../../middleware/helpers/bucket_helper'

class BucketHelperTest < Minitest::Test
  def test_replace_unsafe_chars
    safe_string = "the-quick_brown'fox'jumped(over)the*lazy-dog"
    assert_equal safe_string, BucketHelper.replace_unsafe_chars(safe_string)

    unsafe_string = 'a?b$c%d<e"f&g h'
    safe_string = 'a-b-c-d-e-f-g-h'
    assert_equal safe_string, BucketHelper.replace_unsafe_chars(unsafe_string)
  end

  def test_can_add_persist_indefinitely_tag
    bucket_helper = BucketHelper.new('bucket', '/tmp')
    mock_s3 = mock
    mock_s3.expects(:put_object).with(bucket: 'bucket', key: '/tmp/1/2/filename', body: {}, metadata: {abuse_score: '0'}, tagging: 'persistIndefinitely:true').returns({status: 200})
    mock_s3.expects(:delete_object).never
    bucket_helper.s3 = mock_s3
    bucket_helper.expects(:storage_decrypt_channel_id).returns([1, 2])

    resp = bucket_helper.create_or_replace('encrypted', 'filename', {}, nil, 0, 'persistIndefinitely:true')
    assert_equal({status: 200}, resp)
  end
end
