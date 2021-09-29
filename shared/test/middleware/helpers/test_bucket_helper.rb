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

  def test_returns_comments_if_specified
    bucket_helper = BucketHelper.new('bucket', '/tmp')

    fake_object_versions_response = OpenStruct.new(
      {
        versions: [
          OpenStruct.new({version_id: '1234', last_modified: '0', is_latest: false})
        ]
      }
    )
    mock_s3 = mock
    mock_s3.expects(:list_object_versions).returns(fake_object_versions_response)
    bucket_helper.s3 = mock_s3

    mock_where = mock
    mock_where.expects(:first).returns({comment: 'Comment'}).once
    mock_select = mock
    mock_select.expects(:where).returns(mock_where).once
    mock_table = mock
    mock_table.expects(:select).returns(mock_select).once
    DASHBOARD_DB.expects(:[]).with(:project_versions).returns(mock_table).once
    bucket_helper.expects(:storage_decrypt_channel_id).returns([1, 2])

    version_list = bucket_helper.list_versions('base64', 'main.json', with_comments: true)
    assert_equal [{versionId: '1234', lastModified: '0', comment: 'Comment', isLatest: false}], version_list

    # s3 is a class attribute of BucketHelper and needs to be reset
    # The linter doesn't love this so we have to disable this check here.
    # rubocop:disable Lint/UselessSetterCall
    bucket_helper.s3 = nil
    # rubocop:enable Lint/UselessSetterCall
  end

  def test_omits_comments_if_specified_and_none_exist
    bucket_helper = BucketHelper.new('bucket', '/tmp')

    fake_object_versions_response = OpenStruct.new(
      {
        versions: [
          OpenStruct.new({version_id: '1234', last_modified: '0', is_latest: false})
        ]
      }
    )
    mock_s3 = mock
    mock_s3.expects(:list_object_versions).returns(fake_object_versions_response)
    bucket_helper.s3 = mock_s3

    mock_where = mock
    mock_where.expects(:first).returns({comment: nil}).once
    mock_select = mock
    mock_select.expects(:where).returns(mock_where).once
    mock_table = mock
    mock_table.expects(:select).returns(mock_select).once
    DASHBOARD_DB.expects(:[]).with(:project_versions).returns(mock_table).once
    bucket_helper.expects(:storage_decrypt_channel_id).returns([1, 2])

    version_list = bucket_helper.list_versions('base64', 'main.json', with_comments: true)
    assert_equal [{versionId: '1234', lastModified: '0', isLatest: false}], version_list

    # s3 is a class attribute of BucketHelper and needs to be reset
    # The linter doesn't love this so we have to disable this check here.
    # rubocop:disable Lint/UselessSetterCall
    bucket_helper.s3 = nil
    # rubocop:enable Lint/UselessSetterCall
  end
end
