require_relative 'files_api_test_base' # Must be required first to establish load paths
require_relative 'files_api_test_helper'
require 'cdo/share_filtering'

class SourcesTest < FilesApiTestBase

  def setup
    # Use anonymous Google Geocoder lookups to normalize endpoint URLs and
    # subsequently VCR cassette contents when running tests.
    Geocoder.configure lookup: :google, api_key: nil
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
    file_headers = { 'CONTENT_TYPE' => 'text/javascript' }
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
    first_version = @api.get_object_version(filename, versions.last['versionId'])
    assert_equal file_data, first_version
    second_version = @api.get_object_version(filename, versions.first['versionId'])
    assert_equal new_file_data, second_version

    # Check cache headers
    assert_equal 'private, must-revalidate, max-age=0', last_response['Cache-Control']
  end

  def test_get_source_blocks_profanity_violations
    # Given a Play Lab program with a privacy violation
    filename = 'main.json'
    file_data = File.read(File.expand_path('../fixtures/privacy-profanity/playlab-normal-source.json', __FILE__))
    file_headers = { 'CONTENT_TYPE' => 'application/json' }
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
    file_headers = { 'CONTENT_TYPE' => 'application/json' }
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
    file_headers = { 'CONTENT_TYPE' => 'application/json' }
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
    # Upload a source file.
    filename = 'replace_me.js'
    file_data = 'version 1'
    file_headers = { 'CONTENT_TYPE' => 'text/javascript' }
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

  private

  def delete_all_source_versions(filename)
    delete_all_versions(CDO.sources_s3_bucket, "sources_test/1/1/#{filename}")
  end
end
