require_relative '../../test_helper'
require_relative '../../../cdo/crowdin/legacy_utils'
require 'tempfile'
require 'webmock/minitest'

class MockCrowdinProject < Minitest::Mock
  LATEST_ETAG_VALUE = "0123"

  def id
    "test"
  end

  def languages
    [{"name" => "Test Language", "id" => "i1-8n"}]
  end

  def list_files
    [
      {"id" => 1, "path" => "/foo.bar"},
      {"id" => 2, "path" => "/baz.bat"}
    ]
  end

  def export_file(file, language, etag: nil, attempts: 3, only_head: false)
    mock_response = OpenStruct.new
    if etag.nil? || (etag != LATEST_ETAG_VALUE)
      mock_response.code = 200
      mock_response["data"] = {
        "url" => CrowdinLegacyUtilsTest::DOWNLOAD_URL,
        "etag" => LATEST_ETAG_VALUE
      }
    else
      mock_response.code = 304
    end

    mock_response
  end
end

class CrowdinLegacyUtilsTest < Minitest::Test
  DOWNLOAD_URL = "http://foo.com/"

  def setup
    @mock_project = MockCrowdinProject.new

    stub_request(
      :get,
      DOWNLOAD_URL
    ).to_return(
      status: 200,
      body: "Test body"
    )

    @options = {
      etags_json: Tempfile.new('etags.json'),
      files_to_download_json: Tempfile.new('files_to_download.json'),
      files_to_sync_out_json: Tempfile.new('files_to_sync_out.json'),
      locales_dir: Dir.mktmpdir("locales"),
      logger: Logger.new('/dev/null')
    }
    @utils = Crowdin::LegacyUtils.new(@mock_project, @options)
    @latest_crowdin_etags = {
      "i1-8n" => {
        "/foo.bar" => MockCrowdinProject::LATEST_ETAG_VALUE,
        "/baz.bat" => MockCrowdinProject::LATEST_ETAG_VALUE,
      }
    }
    @latest_files_to_download = {
      "i1-8n" => {
        "/foo.bar" => {
          "download_url" => DOWNLOAD_URL,
          "etag" => MockCrowdinProject::LATEST_ETAG_VALUE
        },
        "/baz.bat" => {
          "download_url" => DOWNLOAD_URL,
          "etag" => MockCrowdinProject::LATEST_ETAG_VALUE
        }
      }
    }
  end

  def test_downloading_is_idempotent
    # +download_changed_files+ should return the same results (files_to_sync_out_json)
    # if it runs multiple times.
    File.write @options[:etags_json], JSON.pretty_generate({})
    File.write @options[:files_to_sync_out_json], JSON.pretty_generate({})

    @utils.download_changed_files
    @utils.download_changed_files

    assert_equal @latest_crowdin_etags, JSON.parse(File.read(@options[:etags_json]))
    assert_equal @latest_crowdin_etags, JSON.parse(File.read(@options[:files_to_sync_out_json]))
  end

  def test_downloading_with_no_changes
    # If files_to_download_json is empty, +download_changed_files+
    # should not modify any local file.
    File.write @options[:files_to_sync_out_json], JSON.pretty_generate({})
    File.write @options[:etags_json], JSON.pretty_generate(@latest_crowdin_etags)

    @utils.download_changed_files

    assert_equal({}, JSON.parse(File.read(@options[:files_to_sync_out_json])))
    assert_equal(@latest_crowdin_etags, JSON.parse(File.read(@options[:etags_json])))
    assert_equal [], Dir.glob(@options[:locales_dir] + "/**/*.*")
  end

  def test_downloading_updates_local_state
    # If +download_changed_files+ successfully downloads files from Crowdin,
    # it should update the local state tracked by etags_json and files_to_sync_out_json.
    File.write @options[:files_to_sync_out_json], JSON.pretty_generate({})
    File.write @options[:etags_json], JSON.pretty_generate({})

    @utils.download_changed_files

    assert_equal @latest_crowdin_etags, JSON.parse(File.read(@options[:files_to_sync_out_json]))
    assert_equal @latest_crowdin_etags, JSON.parse(File.read(@options[:etags_json]))
    expected_local_files = [
      "#{@options[:locales_dir]}/Test Language/baz.bat",
      "#{@options[:locales_dir]}/Test Language/foo.bar"
    ]
    assert_equal expected_local_files, Dir.glob(@options[:locales_dir] + "/**/*.*").sort
  end

  def test_downloading_respects_unchanged_files
    # +download_changed_files+ should respect unchanged files that
    # already exists in etags_json and files_to_sync_out.
    files_to_download = {
      "i1-8n" => {
        "/baz.bat" => {
          "download_url" => DOWNLOAD_URL,
          "etag" => MockCrowdinProject::LATEST_ETAG_VALUE
        }
      }
    }
    files_to_sync_out = {
      "i1-8n" => {
        "/foo.bar" => MockCrowdinProject::LATEST_ETAG_VALUE
      }
    }
    local_etags = {
      "i1-8n" => {
        "/foo.bar" => MockCrowdinProject::LATEST_ETAG_VALUE,
        "/baz.bat" => "not_the_latest_etag"
      }
    }

    File.write @options[:files_to_sync_out_json], JSON.pretty_generate(files_to_sync_out)
    File.write @options[:etags_json], JSON.pretty_generate(local_etags)

    @utils.download_changed_files

    # Deep dup
    expected_downloaded_files = JSON.parse(files_to_download.to_json)
    expected_downloaded_files["i1-8n"]["/baz.bat"] = expected_downloaded_files["i1-8n"]["/baz.bat"]["etag"]

    assert_equal files_to_sync_out.deep_merge(expected_downloaded_files), JSON.parse(File.read(@options[:files_to_sync_out_json]))
    assert_equal local_etags.deep_merge(expected_downloaded_files), JSON.parse(File.read(@options[:etags_json]))
    expected_local_files = ["#{@options[:locales_dir]}/Test Language/baz.bat"]
    assert_equal expected_local_files, Dir.glob(@options[:locales_dir] + "/**/*.*")
  end

  def test_downloading_updates_with_aws_error
    error = {
      status: 503,
      body: "Error"
    }
    success = {
      status: 200,
      body: "Success"
    }
    # Return error on first request, succeed on retry
    stub_request(
      :get,
      DOWNLOAD_URL
    ).to_return(
      error,
      success
    )

    File.write @options[:files_to_sync_out_json], JSON.pretty_generate({})
    File.write @options[:etags_json], JSON.pretty_generate({})

    @utils.download_changed_files

    assert_equal @latest_crowdin_etags, JSON.parse(File.read(@options[:files_to_sync_out_json]))
    assert_equal @latest_crowdin_etags, JSON.parse(File.read(@options[:etags_json]))
    expected_local_files = [
      "#{@options[:locales_dir]}/Test Language/baz.bat",
      "#{@options[:locales_dir]}/Test Language/foo.bar"
    ]
    assert_equal expected_local_files, Dir.glob(@options[:locales_dir] + "/**/*.*").sort
  end
end
