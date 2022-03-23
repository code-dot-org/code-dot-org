require_relative '../../test_helper'
require 'cdo/crowdin/utils'
require 'tempfile'

class MockCrowdinProject < Minitest::Mock
  LATEST_ETAG_VALUE = "0123"

  def id
    "test"
  end

  def languages
    [{"name" => "Test Language", "code" => "i1-8n"}]
  end

  def list_files
    ["/foo.bar", "/baz.bat"]
  end

  def export_file(file, language, etag: nil, attempts: 3, only_head: false)
    mock_response = Minitest::Mock.new
    if etag.nil? || (etag != LATEST_ETAG_VALUE)
      def mock_response.body; "test"; end
      def mock_response.headers; {"etag" => LATEST_ETAG_VALUE}; end
      def mock_response.code; 200; end
    else
      def mock_response.code; 304; end
    end
    mock_response
  end
end

class CrowdinUtilsTest < Minitest::Test
  def setup
    @mock_project = MockCrowdinProject.new

    @options = {
      etags_json: Tempfile.new('etags.json'),
      files_to_download_json: Tempfile.new('files_to_download.json'),
      files_to_sync_out_json: Tempfile.new('files_to_sync_out.json'),
      locales_dir: Dir.mktmpdir("locales"),
      logger: Logger.new('/dev/null')
    }
    @utils = Crowdin::Utils.new(@mock_project, @options)
    @latest_crowdin_etags = {
      "i1-8n" => {
        "/foo.bar" => MockCrowdinProject::LATEST_ETAG_VALUE,
        "/baz.bat" => MockCrowdinProject::LATEST_ETAG_VALUE,
      }
    }
  end

  def test_fetching_with_no_changes
    # When the etag values on local are the same as the ones in Crowdin,
    # +fetch_changes+ should not modify any local file.
    File.write @options[:etags_json], JSON.pretty_generate(@latest_crowdin_etags)
    File.write @options[:files_to_download_json], JSON.pretty_generate({})

    @utils.fetch_changes

    assert_equal @latest_crowdin_etags, JSON.parse(File.read(@options[:etags_json]))
    assert_equal({}, JSON.parse(File.read(@options[:files_to_download_json])))
  end

  def test_fetching_with_empty_local_etags
    # If the local etags_json file is empty, +fetch_changes+
    # should return all the current files in Crowdin.
    File.write @options[:etags_json], JSON.pretty_generate({})
    File.write @options[:files_to_download_json], JSON.pretty_generate({})

    @utils.fetch_changes

    assert_equal({}, JSON.parse(File.read(@options[:etags_json])))
    assert_equal @latest_crowdin_etags, JSON.parse(File.read(@options[:files_to_download_json]))
  end

  def test_fetching_is_idempotent
    # +fetch_changes+ should return the same results (files_to_download_json)
    # if it runs multiple times. And it should not modify its input (etags_json).
    File.write @options[:etags_json], JSON.pretty_generate({})
    File.write @options[:files_to_download_json], JSON.pretty_generate({})

    @utils.fetch_changes
    @utils.fetch_changes

    assert_equal({}, JSON.parse(File.read(@options[:etags_json])))
    assert_equal @latest_crowdin_etags, JSON.parse(File.read(@options[:files_to_download_json]))
  end

  def test_fetching_respects_unchanged_files
    # +fetch_changes+ should return only the files that have newer versions in Crowdin.
    local_etags = {
      "i1-8n" => {
        "/foo.bar" => MockCrowdinProject::LATEST_ETAG_VALUE,
        "/baz.bat" => "not_the_latest_etag"
      }
    }
    File.write @options[:etags_json], JSON.pretty_generate(local_etags)
    File.write @options[:files_to_download_json], JSON.pretty_generate({})

    @utils.fetch_changes

    assert_equal local_etags, JSON.parse(File.read(@options[:etags_json]))
    expected_files_to_download = {
      "i1-8n" => {
        "/baz.bat" => MockCrowdinProject::LATEST_ETAG_VALUE,
      }
    }
    assert_equal expected_files_to_download, JSON.parse(File.read(@options[:files_to_download_json]))
  end

  def test_downloading_with_no_changes
    # If files_to_download_json is empty, +download_changed_files+
    # should not modify any local file.
    File.write @options[:files_to_download_json], JSON.pretty_generate({})
    File.write @options[:files_to_sync_out_json], JSON.pretty_generate({})
    File.write @options[:etags_json], JSON.pretty_generate({})

    @utils.download_changed_files

    assert_equal({}, JSON.parse(File.read(@options[:files_to_download_json])))
    assert_equal({}, JSON.parse(File.read(@options[:files_to_sync_out_json])))
    assert_equal({}, JSON.parse(File.read(@options[:etags_json])))
    assert_equal [], Dir.glob(@options[:locales_dir] + "/**/*.*")
  end

  def test_downloading_updates_local_state
    # If +download_changed_files+ successfully downloads files from Crowdin,
    # it should update the local state tracked by the 3 files: etags_json,
    # files_to_sync_out_json, and files_to_download_json.
    File.write @options[:files_to_download_json], JSON.pretty_generate(@latest_crowdin_etags)
    File.write @options[:files_to_sync_out_json], JSON.pretty_generate({})
    File.write @options[:etags_json], JSON.pretty_generate({})

    @utils.download_changed_files

    assert_equal({}, JSON.parse(File.read(@options[:files_to_download_json])))
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
        "/baz.bat" => MockCrowdinProject::LATEST_ETAG_VALUE
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

    File.write @options[:files_to_download_json], JSON.pretty_generate(files_to_download)
    File.write @options[:files_to_sync_out_json], JSON.pretty_generate(files_to_sync_out)
    File.write @options[:etags_json], JSON.pretty_generate(local_etags)

    @utils.download_changed_files

    assert_equal({}, JSON.parse(File.read(@options[:files_to_download_json])))
    assert_equal files_to_sync_out.deep_merge(files_to_download), JSON.parse(File.read(@options[:files_to_sync_out_json]))
    assert_equal local_etags.deep_merge(files_to_download), JSON.parse(File.read(@options[:etags_json]))
    expected_local_files = ["#{@options[:locales_dir]}/Test Language/baz.bat"]
    assert_equal expected_local_files, Dir.glob(@options[:locales_dir] + "/**/*.*")
  end
end
