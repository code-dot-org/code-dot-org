require_relative 'files_api_test_base' # Must be required first to establish load paths
require_relative 'files_api_test_helper'
require 'cdo/share_filtering'
require 'timecop'
require 'cdo/firehose'

MAIN_JSON = 'main.json'

class SourcesTest < FilesApiTestBase
  def setup
    # Stub out helpers that make remote API calls
    WebPurify.stubs(:find_potential_profanity).returns false
    Geocoder.stubs(:find_potential_street_address).returns false

    @channel = create_channel
    @api = FilesApiTestHelper.new(current_session, 'sources', @channel)

    # Sources operations are animation-manifest aware, so some of our tests
    # also interact with the animations API.
    @animations_api = FilesApiTestHelper.new(current_session, 'animations', @channel)
  end

  def teardown
    # Require that tests delete the files they upload
    @api.list_objects
    assert_empty JSON.parse(last_response.body), "No leftover source files"

    @animations_api.list_objects
    assert_empty JSON.parse(last_response.body), "No leftover animations"

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

    delete_all_source_versions(filename)
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

    delete_all_source_versions(filename)
  end

  def test_get_source_blocks_privacy_violations
    filename = 'main.json'
    file_data = File.read(File.expand_path('../fixtures/privacy-profanity/playlab-privacy-violation-source.json', __FILE__))
    file_headers = {'CONTENT_TYPE' => 'application/json'}
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

    delete_all_source_versions(filename)
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

    delete_all_source_versions(filename)

    Timecop.return
  end

  def test_restore_main_json_version
    # Write version 1
    v1_data = {"source": "//version 1"}.stringify_keys
    v1_version_id = put_main_json(v1_data)

    # Write version 2
    v2_data = {"source": "//version 2"}.stringify_keys
    v2_version_id = put_main_json(v2_data)

    # Restore version 1
    restored_version_id = restore_main_json(v1_version_id)

    # List versions.
    versions = @api.list_object_versions(MAIN_JSON)
    assert successful?
    assert_equal 3, versions.count
    assert_equal(
      [restored_version_id, v2_version_id, v1_version_id],
      versions.map {|v| v['versionId']}
    )

    # New version id, same body
    restored_data = @api.get_object(MAIN_JSON)
    assert_equal_json v1_data.to_json, restored_data

    delete_all_source_versions(MAIN_JSON)
  end

  def test_restore_main_json_and_animations
    animation_key = @api.add_random_suffix('animation-key')
    animation_filename = "#{animation_key}.png"
    delete_all_animation_versions(animation_filename)

    # Create an animation
    animation_v1 = 'stub-png-v1'
    animation_v1_vid = put_animation(animation_filename, animation_v1)

    # Upload main.json version 1
    v1_parsed = {
      "source": "//version 1",
      "animations": {
        "orderedKeys": [animation_key],
        "propsByKey": {
          "#{animation_key}": {
            "name": "Test animation",
            "version": animation_v1_vid
          }
        }
      }
    }.stringify_keys
    main_json_v1_vid = put_main_json(v1_parsed)

    # Modify the animation
    animation_v2_vid = put_animation(animation_filename, 'stub-png-v2')

    # Update main.json
    main_json_v2 = {
      "source": "//version 2",
      "animations": {
        "orderedKeys": [animation_key],
        "propsByKey": {
          "#{animation_key}": {
            "name": "Test animation",
            "version": animation_v2_vid
          }
        }
      }
    }.stringify_keys
    main_json_v2_vid = put_main_json(main_json_v2)

    # Restore main.json to v1
    main_json_restored_vid = restore_main_json(main_json_v1_vid)

    # Expect animation to have a v3 based on v1
    animation_versions = @animations_api.list_object_versions(animation_filename)
    assert successful?
    assert_equal 3, animation_versions.count
    animation_restored_vid = animation_versions[0]['versionId']
    assert_equal animation_v2_vid, animation_versions[1]['versionId']
    assert_equal animation_v1_vid, animation_versions[2]['versionId']
    refute_equal animation_v1_vid, animation_restored_vid
    refute_equal animation_v2_vid, animation_restored_vid

    @animations_api.get_object(animation_filename)
    assert_equal(animation_v1, last_response.body)

    # Expect main.json to have a v3 based on v1
    main_json_versions = @api.list_object_versions(MAIN_JSON)
    assert successful?
    assert_equal 3, main_json_versions.count
    assert_equal main_json_restored_vid, main_json_versions[0]['versionId']
    assert_equal main_json_v2_vid, main_json_versions[1]['versionId']
    assert_equal main_json_v1_vid, main_json_versions[2]['versionId']
    refute_equal main_json_v1_vid, main_json_restored_vid
    refute_equal main_json_v2_vid, main_json_restored_vid

    # Expect latest main.json v3 to reference animation v3
    @api.get_object(MAIN_JSON)
    v3_parsed = JSON.parse(last_response.body)
    assert_equal(v1_parsed['source'], v3_parsed['source'])
    assert_equal(
      animation_restored_vid,
      v3_parsed['animations']['propsByKey'][animation_key]['version']
    )

    delete_all_animation_versions(animation_filename)
    delete_all_source_versions(MAIN_JSON)
  end

  def test_restore_main_json_with_library_animation
    animation_key = @api.add_random_suffix('animation-key')
    animation_filename = "#{animation_key}.png"
    delete_all_animation_versions(animation_filename)
    delete_all_source_versions(MAIN_JSON)

    # Upload main.json version 1
    v1_parsed = {
      "source": "//version 1",
      "animations": {
        "orderedKeys": [animation_key],
        "propsByKey": {
          "#{animation_key}": {
            "name": "fly_bot_1",
            "sourceUrl": "/api/v1/animation-library/MJtsP4ka97JNo5OP2X_Csrs2A0TYgarT/category_characters/fly_bot.png",
            "version": "MJtsP4ka97JNo5OP2X_Csrs2A0TYgarT"
          }.stringify_keys
        }.stringify_keys
      }.stringify_keys
    }.stringify_keys
    main_json_v1_vid = put_main_json(v1_parsed)

    # Modify the animation
    animation_v2_vid = put_animation(animation_filename, 'modified-library-animation')

    # Update main.json
    main_json_v2 = {
      "source": "//version 2",
      "animations": {
        "orderedKeys": [animation_key],
        "propsByKey": {
          "#{animation_key}": {
            "name": "Test animation",
            "sourceUrl": nil,
            "version": animation_v2_vid
          }
        }
      }
    }.stringify_keys
    main_json_v2_vid = put_main_json(main_json_v2)

    # Restore main.json to v1
    main_json_restored_vid = restore_main_json(main_json_v1_vid)

    # Expect only one animation version in the bucket - no need to make
    # changes since we restored back to using the library animation
    animation_versions = @animations_api.list_object_versions(animation_filename)
    assert successful?
    assert_equal 1, animation_versions.count
    assert_equal animation_v2_vid, animation_versions[0]['versionId']

    # Expect main.json to have a v3 based on v1
    main_json_versions = @api.list_object_versions(MAIN_JSON)
    assert successful?
    assert_equal 3, main_json_versions.count
    assert_equal main_json_restored_vid, main_json_versions[0]['versionId']
    assert_equal main_json_v2_vid, main_json_versions[1]['versionId']
    assert_equal main_json_v1_vid, main_json_versions[2]['versionId']
    refute_equal main_json_v1_vid, main_json_restored_vid
    refute_equal main_json_v2_vid, main_json_restored_vid

    # Expect latest main.json v3 to reference library animation
    @api.get_object(MAIN_JSON)
    v3_parsed = JSON.parse(last_response.body)
    assert_equal(v1_parsed['source'], v3_parsed['source'])
    assert_equal(
      v1_parsed['animations']['propsByKey'][animation_key],
      v3_parsed['animations']['propsByKey'][animation_key]
    )

    delete_all_animation_versions(animation_filename)
    delete_all_source_versions(MAIN_JSON)
  end

  def test_restore_main_json_with_bad_animation_versions
    assert_restores_main_json_with_animation_version 'not_a_real_version_id'
  end

  def test_restore_main_json_with_empty_animation_versions
    assert_restores_main_json_with_animation_version ''
  end

  def test_restore_main_json_with_null_animation_versions
    assert_restores_main_json_with_animation_version nil
  end

  def test_remix_source_file
    # Mock destination
    @destination_channel = create_channel
    @destination_api = FilesApiTestHelper.new(current_session, 'sources', @destination_channel)
    @destination_animation_api = FilesApiTestHelper.new(current_session, 'animations', @destination_channel)

    # Create two animations
    animation_key_1 = @api.add_random_suffix('animation-key')
    animation_key_2 = @api.add_random_suffix('animation-key-1')
    animation_filename_1 = "#{animation_key_1}.png"
    animation_filename_2 = "#{animation_key_2}.png"
    delete_all_animation_versions(animation_filename_1)
    delete_all_animation_versions(animation_filename_2)

    # Upload the two animations
    animation_1 = 'stub-png-1'
    animation_2 = 'stub-png-2'
    animation_1_vid = put_animation(animation_filename_1, animation_1)
    animation_2_vid = put_animation(animation_filename_2, animation_2)

    # Update main.json
    main_json_v1 = {
      "source": "//version 1",
      "animations": {
        "orderedKeys": [animation_key_1, animation_key_2],
        "propsByKey": {
          "#{animation_key_1}": {
            "name": "Remix First",
            "sourceUrl": nil,
            "version": animation_1_vid
          },
          "#{animation_key_2}": {
            "name": "Remix Second",
            "sourceUrl": nil,
            "version": animation_2_vid
          }
        }
      }
    }.stringify_keys
    put_main_json(main_json_v1)

    # Remix
    animation_list = AnimationBucket.new.copy_files @channel, @destination_channel
    SourceBucket.new.remix_source @channel, @destination_channel, animation_list

    # Check that source manifest exists in destination channel
    # Check that destination source includes a reference to the
    # animation with a different version than that in the original destination
    remixed_source = @destination_api.get_object(MAIN_JSON)
    assert successful?
    props = JSON.parse(remixed_source)['animations']['propsByKey']
    refute_includes [animation_1_vid, animation_2_vid], props[animation_key_1]['version']
    refute_includes [animation_1_vid, animation_2_vid], props[animation_key_2]['version']

    # Check that manifest in destination references the version id of the animation
    # that exists in the destination
    remixed_animation_versions_1 = @destination_animation_api.list_object_versions(animation_filename_1)
    remixed_animation_versions_2 = @destination_animation_api.list_object_versions(animation_filename_2)
    assert successful?
    assert_includes [props[animation_key_1]['version'], props[animation_key_2]['version']], remixed_animation_versions_1[0]['versionId']
    assert_includes [props[animation_key_1]['version'], props[animation_key_2]['version']], remixed_animation_versions_2[0]['versionId']

    # Clear original and remixed buckets
    delete_all_source_versions(MAIN_JSON)
    delete_all_animation_versions(animation_filename_1)
    delete_all_animation_versions(animation_filename_2)

    delete_all_versions(CDO.sources_s3_bucket, "sources_test/1/2/#{MAIN_JSON}")
    delete_all_versions(CDO.animations_s3_bucket, "animations_test/1/2/#{animation_filename_1}")
    delete_all_versions(CDO.animations_s3_bucket, "animations_test/1/2/#{animation_filename_2}")
  end

  def test_remix_source_file_with_library_animations
    # Mock destination
    @destination_channel = create_channel
    @destination_api = FilesApiTestHelper.new(current_session, 'sources', @destination_channel)
    @destination_animation_api = FilesApiTestHelper.new(current_session, 'animations', @destination_channel)

    animation_key = @api.add_random_suffix('animation-key')

    # Update main.json
    main_json_v1 = {
      "source": "Remix Library",
      "animations": {
        "orderedKeys": [animation_key],
        "propsByKey": {
          "#{animation_key}": {
            "name": "bear_1",
            "sourceUrl": "https://studio.code.org/api/test/url/category_animals/bear.png",
            "version": "1234"
          }
        }
      }
    }.stringify_keys
    put_main_json(main_json_v1)

    # Remix
    animation_list = AnimationBucket.new.copy_files @channel, @destination_channel
    SourceBucket.new.remix_source @channel, @destination_channel, animation_list

    # Check that source manifest exists in destination channel
    # Check that destination source includes a reference to the
    # animation with a different version than that in the original destination
    remixed_source = @destination_api.get_object(MAIN_JSON)
    assert successful?
    props = JSON.parse(remixed_source)['animations']['propsByKey']
    assert_equal "1234", props[animation_key]['version']

    # Clear original and remixed buckets
    delete_all_source_versions(MAIN_JSON)

    delete_all_versions(CDO.sources_s3_bucket, "sources_test/1/2/#{MAIN_JSON}")
  end

  def test_remix_not_main
    # Mock destination
    @destination_channel = create_channel
    @destination_api = FilesApiTestHelper.new(current_session, 'sources', @destination_channel)

    # Create non-main file
    src_file_v1 = {
      "source": "this is not a main.json file"
    }.stringify_keys
    @api.put_object('test.json', src_file_v1.to_json, {'CONTENT_TYPE' => 'application/json'})

    # Remix
    animation_list = AnimationBucket.new.copy_files @channel, @destination_channel
    SourceBucket.new.remix_source @channel, @destination_channel, animation_list

    # Check that source exists in destination channel
    # Check that remix-ed file is equal to the original file
    remixed_source = @destination_api.get_object('test.json')
    assert successful?
    assert_equal src_file_v1.to_json, remixed_source

    # Clear original and remixed buckets
    delete_all_source_versions('test.json')

    delete_all_versions(CDO.sources_s3_bucket, "sources_test/1/2/test.json")
  end

  def test_remix_no_animations
    # Mock destination
    @destination_channel = create_channel
    @destination_api = FilesApiTestHelper.new(current_session, 'sources', @destination_channel)

    # Update main.json
    main_json_v1 = {
      "source": "//version 1",
      "animations": {
        "orderedKeys": [],
        "propsByKey": {}
      }
    }.stringify_keys
    put_main_json(main_json_v1)

    # Remix
    animation_list = AnimationBucket.new.copy_files @channel, @destination_channel
    SourceBucket.new.remix_source @channel, @destination_channel, animation_list

    # Check that source exists in destination channel
    # Check that remixed source does not contain animations
    remixed_source = @destination_api.get_object(MAIN_JSON)
    assert successful?
    props = JSON.parse(remixed_source)['animations']
    assert_equal props["orderedKeys"], []

    # Clear original and remixed buckets
    delete_all_source_versions(MAIN_JSON)

    delete_all_versions(CDO.sources_s3_bucket, "sources_test/1/2/#{MAIN_JSON}")
  end

  private

  def assert_restores_main_json_with_animation_version(version_value)
    delete_all_source_versions(MAIN_JSON)

    animation_key = @api.add_random_suffix('animation-key')
    animation_filename = "#{animation_key}.png"
    delete_all_animation_versions(animation_filename)

    # Create an animation
    animation_v1_vid = put_animation(animation_filename, 'stub-png-v1')

    # Upload main.json version 1 with bad animation version
    v1_parsed = {
      "source": "//version 1",
      "animations": {
        "orderedKeys": [animation_key],
        "propsByKey": {
          "#{animation_key}": {
            "name": "Test animation v1",
            "version": version_value
          }
        }
      }
    }.stringify_keys
    main_json_v1_vid = put_main_json(v1_parsed)

    # Modify the animation
    animation_v2 = 'stub-png-v2'
    animation_v2_vid = put_animation(animation_filename, animation_v2)

    # Update main.json, with different bad version
    main_json_v2 = {
      "source": "//version 2",
      "animations": {
        "orderedKeys": [animation_key],
        "propsByKey": {
          "#{animation_key}": {
            "name": "Test animation v2",
            "version": version_value
          }
        }
      }
    }.stringify_keys
    main_json_v2_vid = put_main_json(main_json_v2)

    # Restore main.json to v1
    main_json_restored_vid = restore_main_json(main_json_v1_vid)

    # Expect animation to have a v3 based on v2
    animation_versions = @animations_api.list_object_versions(animation_filename)
    assert successful?
    assert_equal 3, animation_versions.count
    animation_restored_vid = animation_versions[0]['versionId']
    assert_equal animation_v2_vid, animation_versions[1]['versionId']
    assert_equal animation_v1_vid, animation_versions[2]['versionId']
    refute_equal animation_v1_vid, animation_restored_vid
    refute_equal animation_v2_vid, animation_restored_vid

    @animations_api.get_object(animation_filename)
    assert_equal(animation_v2, last_response.body)

    # Expect main.json to have a v3 based on v1
    main_json_versions = @api.list_object_versions(MAIN_JSON)
    assert successful?
    assert_equal 3, main_json_versions.count
    assert_equal main_json_restored_vid, main_json_versions[0]['versionId']
    assert_equal main_json_v2_vid, main_json_versions[1]['versionId']
    assert_equal main_json_v1_vid, main_json_versions[2]['versionId']
    refute_equal main_json_v1_vid, main_json_restored_vid
    refute_equal main_json_v2_vid, main_json_restored_vid

    # Expect latest main.json v3 to reference animation v3
    @api.get_object(MAIN_JSON)
    v3_parsed = JSON.parse(last_response.body)
    assert_equal(v1_parsed['source'], v3_parsed['source'])
    assert_equal(
      animation_restored_vid,
      v3_parsed['animations']['propsByKey'][animation_key]['version']
    )

    delete_all_animation_versions(animation_filename)
    delete_all_source_versions(MAIN_JSON)
  end

  #
  # Upload a new main.json version to the API
  # @param [Hash] body The main.json data given as a hash with string keys.
  # @return [String] S3 version id of the uploaded file
  #
  def put_main_json(body)
    @api.put_object(MAIN_JSON, body.to_json, {'CONTENT_TYPE' => 'application/json'})
    assert successful?
    JSON.parse(last_response.body)['versionId']
  end

  #
  # Upload a new animation version to the API
  # @param [String] filename The animation filename (usually <key>.png)
  # @param [String] body The animation file body
  # @return [String] S3 version id of the uploaded file
  #
  def put_animation(filename, body)
    @animations_api.post_file(filename, body, 'image/png')
    assert successful?
    JSON.parse(last_response.body)['versionId']
  end

  #
  # Restore a source file to the requested version
  # @param [String] version_id The S3 version id to restore
  # @return [String] S3 version id of the newly-restored main.json
  #
  def restore_main_json(version_id)
    @api.restore_sources_version(MAIN_JSON, version_id)
    assert successful?
    JSON.parse(last_response.body)['version_id']
  end

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
