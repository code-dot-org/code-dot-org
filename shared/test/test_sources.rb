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
    assert successful?
    restored_version_id = restore_result['version_id']
    third_version = @api.get_object_version(filename, restored_version_id)

    # New version id, same body
    refute_equal first_version_id, restored_version_id
    assert_equal file_data, third_version
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

  def test_restore_main_json_version
    filename = 'main.json'
    v1_data = <<-JSON
      {"source":"//version 1"}
    JSON
    file_headers = {'CONTENT_TYPE' => 'text/javascript'}
    delete_all_source_versions(filename)

    # Upload version 1
    v1_result = @api.put_object(filename, v1_data, file_headers)
    assert successful?
    v1_version_id = JSON.parse(v1_result)['versionId']

    # Write version 2
    v2_data = <<-JSON
      {"source":"//version 2"}
    JSON
    v2_result = @api.put_object(filename, v2_data, file_headers)
    assert successful?
    v2_version_id = JSON.parse(v2_result)['versionId']

    # Restore version 1
    restore_result = @api.restore_sources_version(filename, v1_version_id)
    restored_version_id = restore_result['version_id']

    # List versions.
    versions = @api.list_object_versions(filename)
    assert successful?
    assert_equal 3, versions.count
    assert_equal(
      [restored_version_id, v2_version_id, v1_version_id],
      versions.map {|v| v['versionId']}
    )

    # New version id, same body
    restored_data = @api.get_object(filename)
    assert_equal_json v1_data, restored_data
  end

  def test_restore_main_json_and_animations
    animations_api = FilesApiTestHelper.new(current_session, 'animations', @channel)

    animation_key = 'animation-key'
    animation_filename = "#{animation_key}.png"
    delete_all_animation_versions(animation_filename)

    # Create an animation
    animation_v1 = 'stub-png-v1'
    animations_api.post_file(animation_filename, animation_v1, 'image/png')
    assert successful?
    animation_v1_vid = JSON.parse(last_response.body)['versionId']

    # Upload main.json version 1
    main_json_filename = 'main.json'
    delete_all_source_versions(main_json_filename)
    file_headers = {'CONTENT_TYPE' => 'text/javascript'}
    main_json_v1 = <<-JSON
      {
        "source":"//version 1",
        "animations": {
          "orderedKeys": [
            "#{animation_key}"
          ],
          "propsByKey": {
            "#{animation_key}": {
              "name": "Test animation",
              "frameCount": 3,
              "version": "#{animation_v1_vid}"
            }
          }
        }
      }
    JSON
    v1_parsed = JSON.parse(main_json_v1)
    @api.put_object(main_json_filename, main_json_v1, file_headers)
    assert successful?
    main_json_v1_vid = JSON.parse(last_response.body)['versionId']

    # Modify the animation
    animation_v2 = 'stub-png-v2'
    animations_api.post_file(animation_filename, animation_v2, 'image/png')
    assert successful?
    animation_v2_vid = JSON.parse(last_response.body)['versionId']

    # Update main.json
    main_json_v2 = <<-JSON
      {
        "source":"//version 2",
        "animations": {
          "orderedKeys": [
            "#{animation_key}"
          ],
          "propsByKey": {
            "#{animation_key}": {
              "name": "Test animation",
              "frameCount": 3,
              "version": "#{animation_v2_vid}"
            }
          }
        }
      }
    JSON
    @api.put_object(main_json_filename, main_json_v2, file_headers)
    assert successful?
    main_json_v2_vid = JSON.parse(last_response.body)['versionId']

    # Restore main.json to v1
    @api.restore_sources_version(main_json_filename, main_json_v1_vid)
    assert successful?
    main_json_restored_vid = JSON.parse(last_response.body)['version_id']

    # Expect animation to have a v3 based on v1
    animation_versions = animations_api.list_object_versions(animation_filename)
    assert successful?
    assert_equal 3, animation_versions.count
    animation_restored_vid = animation_versions[0]['versionId']
    assert_equal animation_v2_vid, animation_versions[1]['versionId']
    assert_equal animation_v1_vid, animation_versions[2]['versionId']
    refute_equal animation_v1_vid, animation_restored_vid
    refute_equal animation_v2_vid, animation_restored_vid

    animations_api.get_object(animation_filename)
    assert_equal(animation_v1, last_response.body)

    # Expect main.json to have a v3 based on v1
    main_json_versions = @api.list_object_versions(main_json_filename)
    assert successful?
    assert_equal 3, main_json_versions.count
    assert_equal main_json_restored_vid, main_json_versions[0]['versionId']
    assert_equal main_json_v2_vid, main_json_versions[1]['versionId']
    assert_equal main_json_v1_vid, main_json_versions[2]['versionId']
    refute_equal main_json_v1_vid, main_json_restored_vid
    refute_equal main_json_v2_vid, main_json_restored_vid

    # Expect latest main.json v3 to reference animation v3
    @api.get_object(main_json_filename)
    v3_parsed = JSON.parse(last_response.body)
    assert_equal(v1_parsed['source'], v3_parsed['source'])
    assert_equal(
      animation_restored_vid,
      v3_parsed['animations']['propsByKey'][animation_key]['version']
    )
  end

  private

  def delete_all_source_versions(filename)
    delete_all_versions(CDO.sources_s3_bucket, "sources_test/1/1/#{filename}")
  end

  def delete_all_animation_versions(filename)
    delete_all_versions(CDO.animations_s3_bucket, "animations_test/1/1/#{filename}")
  end

  def assert_equal_json(expected_json, actual_json)
    pretty_expected = JSON.pretty_generate JSON.parse expected_json
    pretty_actual = JSON.pretty_generate JSON.parse actual_json
    assert_equal pretty_expected, pretty_actual
  end
end
