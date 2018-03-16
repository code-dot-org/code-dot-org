require_relative 'files_api_test_base' # Must be required first to establish load paths
require_relative 'files_api_test_helper'
require 'cdo/share_filtering'
require 'timecop'
require 'cdo/firehose'

class SourcesTest < FilesApiTestBase
  def setup
    # Stub out helpers that make remote API calls
    WebPurify.stubs(:find_potential_profanity).returns false
    Geocoder.stubs(:find_potential_street_address).returns false

    @channel = create_channel
    @api = FilesApiTestHelper.new(current_session, 'sources', @channel)
  end

  def teardown
    delete_channel(@channel)
    @channel = nil
  end

  def test_source_versions
    # Upload a source file.
    filename = 'test.js'
    file_data = 'abc 123'
    file_headers = {'CONTENT_TYPE' => 'text/javascript'}
    delete_all_source_versions(filename)
    @api.put_object(filename, file_data, file_headers)
    assert successful?

    # Overwrite it.
    new_file_data = 'def 456'
    @api.put_object(filename, new_file_data, file_headers)
    assert successful?

    # Delete it.
    @api.delete_object(filename)
    assert successful?

    # List versions.
    versions = @api.list_object_versions(filename)
    assert successful?
    assert_equal 2, versions.count

    # Get the first and second version.
    first_version_id = versions.last['versionId']
    first_version = @api.get_object_version(filename, first_version_id)
    assert_equal file_data, first_version
    second_version_id = versions.first['versionId']
    second_version = @api.get_object_version(filename, second_version_id)
    assert_equal new_file_data, second_version

    # Check cache headers
    assert_match 'private, must-revalidate, max-age=0', last_response['Cache-Control']

    # Restore the first version
    restore_result = @api.restore_sources_version(filename, first_version_id)
    restored_version_id = restore_result['version_id']
    third_version = @api.get_object_version(filename, restored_version_id)

    # New version id, same body
    refute_equal first_version_id, restored_version_id
    assert_equal file_data, third_version
  end

  def test_404_on_malformed_version_id
    filename = 'test.js'
    file_data = 'abc 123'
    file_headers = {'CONTENT_TYPE' => 'text/javascript'}
    delete_all_source_versions(filename)

    # Upload a file
    @api.put_object(filename, file_data, file_headers)
    assert successful?

    # Create a malformed version id
    bad_version_id = 'malformed-version-id'

    @api.get_object_version(filename, bad_version_id)
    assert_equal 404, last_response.status

    delete_all_source_versions(filename)
  end

  def test_404_on_version_not_found
    filename = 'test.js'
    file_headers = {'CONTENT_TYPE' => 'text/javascript'}
    delete_all_source_versions(filename)

    # Upload a file
    @api.put_object(filename, 'first', file_headers)
    assert successful?
    v1 = JSON.parse(last_response.body)['versionId']

    # Overwrite the first version
    # (This operation deletes the first version)
    @api.put_object_version(filename, v1, 'second', file_headers)
    assert successful?
    v2 = JSON.parse(last_response.body)['versionId']

    # After overwrite, we have a new version id
    refute_equal(v1, v2)

    # Try to retrieve the deleted version
    @api.get_object_version(filename, v1)
    assert_equal 404, last_response.status

    delete_all_source_versions(filename)
  end

  def test_get_source_blocks_profanity_violations
    # Given a Play Lab program with a privacy violation
    filename = 'main.json'
    file_data = File.read(File.expand_path('../fixtures/privacy-profanity/playlab-normal-source.json', __FILE__))
    file_headers = {'CONTENT_TYPE' => 'application/json'}
    delete_all_source_versions(filename)
    @api.put_object(filename, file_data, file_headers)
    assert successful?

    # Given a program with profanity
    WebPurify.stubs(:find_potential_profanity).returns true

    # owner can view
    @api.get_object(filename)
    assert successful?

    # non-owner cannot view
    with_session(:non_owner) do
      non_owner_api = FilesApiTestHelper.new(current_session, 'sources', @channel)
      non_owner_api.get_object(filename)
      refute successful?
      assert not_found?
    end
  end

  def test_get_source_blocks_privacy_violations
    filename = 'main.json'
    file_data = File.read(File.expand_path('../fixtures/privacy-profanity/playlab-privacy-violation-source.json', __FILE__))
    file_headers = {'CONTENT_TYPE' => 'application/json'}
    delete_all_source_versions(filename)
    @api.put_object(filename, file_data, file_headers)
    assert successful?

    # Given a program with profanity or PII
    WebPurify.stubs(:find_potential_profanity).returns true

    # owner can view
    @api.get_object(filename)
    assert successful?

    # admin can view
    with_session(:admin) do
      admin_api = FilesApiTestHelper.new(current_session, 'sources', @channel)
      FilesApi.any_instance.stubs(:admin?).returns(true)
      admin_api.get_object(filename)
      assert successful?
      FilesApi.any_instance.unstub(:admin?)
    end

    # non-owner cannot view
    with_session(:non_owner) do
      non_owner_api = FilesApiTestHelper.new(current_session, 'sources', @channel)
      non_owner_api.get_object(filename)
      refute successful?
      assert not_found?
    end

    # teacher cannot view
    with_session(:teacher) do
      teacher_api = FilesApiTestHelper.new(current_session, 'sources', @channel)
      FilesApi.any_instance.stubs(:teaches_student?).returns(true)
      teacher_api.get_object(filename)
      refute successful?
      assert not_found?
      FilesApi.any_instance.unstub(:teaches_student?)
    end

    delete_all_source_versions(filename)
  end

  def test_policy_channel_api
    filename = 'main.json'
    file_data = File.read(File.expand_path('../fixtures/privacy-profanity/playlab-privacy-violation-source.json', __FILE__))
    file_headers = {'CONTENT_TYPE' => 'application/json'}
    delete_all_source_versions(filename)
    @api.put_object(filename, file_data, file_headers)
    assert successful?
    policy_check_response = @api.channel_policy_violation
    assert successful?

    # use assert_equal to check both type and value of response (true vs 'true')
    assert_equal true, JSON.parse(policy_check_response)['has_violation']

    delete_all_source_versions(filename)
  end

  def test_replace_version
    FirehoseClient.instance.expects(:putRecord).never

    # Upload a source file.
    filename = 'replace_me.js'
    file_data = 'version 1'
    file_headers = {'CONTENT_TYPE' => 'text/javascript'}
    delete_all_source_versions(filename)
    @api.put_object(filename, file_data, file_headers)
    assert successful?
    response = JSON.parse(last_response.body)

    # Overwrite it, specifying the same version.
    new_file_data = 'version 2'
    @api.put_object_version(filename, response['versionId'], new_file_data, file_headers)
    assert successful?

    # List versions.
    versions = @api.list_object_versions(filename)
    assert successful?
    assert_equal 1, versions.count
  end

  def test_replace_main_json_version
    # FirehoseClient.instance.expects(:put_record).never
    Timecop.freeze

    filename = 'main.json'
    file_data = 'version 1'
    file_headers = {'CONTENT_TYPE' => 'text/javascript'}
    @api.put_object(filename, file_data, file_headers)
    assert successful?
    response = JSON.parse(last_response.body)
    timestamp1 = response['timestamp'].to_s
    # this assert passes locally but fails on circle
    # assert_equal timestamp1, Time.now.to_s
    version1 = response['versionId']

    Timecop.travel 1

    file_data = 'version 2'
    file_headers = {'CONTENT_TYPE' => 'text/javascript'}
    @api.put_object(filename, file_data, file_headers)
    assert successful?

    Timecop.travel 1

    # log when replacing non-current version.
    FirehoseClient.instance.expects(:put_record).with do |data|
      data_json_data = JSON.parse(data[:data_json])
      data[:study] == 'project-data-integrity' &&
        data[:event] == 'replace-non-current-main-json' &&
        data[:project_id] == @channel &&
        data_json_data['replacedVersionId'] == version1
    end

    file_data = 'version 3'
    @api.put_object_version(filename, version1, file_data, file_headers, timestamp1)
    assert successful?

    Timecop.return
  end

  private

  def delete_all_source_versions(filename)
    delete_all_versions(CDO.sources_s3_bucket, "sources_test/1/1/#{filename}")
  end
end
