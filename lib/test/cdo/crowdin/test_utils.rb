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

  def test_fetching_no_changes
    File.write @options[:etags_json], JSON.pretty_generate(@latest_crowdin_etags)
    File.write @options[:files_to_download_json], JSON.pretty_generate({})

    @utils.fetch_changes

    assert_equal @latest_crowdin_etags, JSON.parse(File.read(@options[:etags_json]))
    assert_equal({}, JSON.parse(File.read(@options[:files_to_download_json])))
  end

  def test_fetching_with_empty_local_etags
    File.write @options[:etags_json], JSON.pretty_generate({})
    File.write @options[:files_to_download_json], JSON.pretty_generate({})

    @utils.fetch_changes

    assert_equal({}, JSON.parse(File.read(@options[:etags_json])))
    assert_equal @latest_crowdin_etags, JSON.parse(File.read(@options[:files_to_download_json]))
  end

  def test_fetching_is_idempotent
    File.write @options[:etags_json], JSON.pretty_generate({})
    File.write @options[:files_to_download_json], JSON.pretty_generate({})

    @utils.fetch_changes
    @utils.fetch_changes

    assert_equal({}, JSON.parse(File.read(@options[:etags_json])))
    assert_equal @latest_crowdin_etags, JSON.parse(File.read(@options[:files_to_download_json]))
  end

  def test_fetching_respects_unchanged_files
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

  def test_download_changed_files_only_downloads_changes
    File.write(@options[:changes_json], "{}")
    @utils.download_changed_files
    assert_equal Dir.glob(@options[:locales_dir] + "/**/*.*"), []

    changes = {
      "i1-8n": {
        "/baz.bat": "this is an etag"
      }
    }
    File.write(@options[:changes_json], JSON.pretty_generate(changes))
    @utils.download_changed_files
    assert_equal Dir.glob(@options[:locales_dir] + "/**/*.*"), [@options[:locales_dir] + "/Test Language/baz.bat"]
  end
end
