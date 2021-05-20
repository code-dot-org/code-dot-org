require_relative '../../test_helper'
require 'cdo/crowdin/utils'
require 'tempfile'

class MockCrowdinProject < Minitest::Mock
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
    if etag.nil?
      def mock_response.body; "test"; end
      def mock_response.headers; {"etag" => "this is an etag"}; end
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
      changes_json: Tempfile.new('changes.json'),
      locales_dir: Dir.mktmpdir("locales"),
      logger: Logger.new('/dev/null')
    }
    File.write(@options[:etags_json], "{}")
    @utils = Crowdin::Utils.new(@mock_project, @options)
  end

  def test_fetch_changes_updates_etags
    File.write(@options[:etags_json], "{}")
    assert_equal "{}", File.read(@options[:etags_json])
    @utils.fetch_changes
    expected = {
      "i1-8n": {
        "/foo.bar": "this is an etag",
        "/baz.bat": "this is an etag",
      }
    }
    assert_equal JSON.pretty_generate(expected), File.read(@options[:etags_json])
  end

  def test_fetch_changes_updates_changes
    File.write(@options[:changes_json], "{}")
    assert_equal "{}", File.read(@options[:changes_json])
    @utils.fetch_changes
    expected = {
      "i1-8n": {
        "/foo.bar": "this is an etag",
        "/baz.bat": "this is an etag",
      }
    }
    assert_equal JSON.pretty_generate(expected), File.read(@options[:changes_json])
  end

  def test_fetch_changes_respects_unchanged_files
    before = {
      "i1-8n": {
        "/foo.bar": "this is an etag",
        "/baz.bat": nil
      }
    }
    File.write(@options[:etags_json], JSON.pretty_generate(before))
    @utils.fetch_changes
    expected = {
      "i1-8n": {
        "/baz.bat": "this is an etag"
      }
    }
    assert_equal JSON.pretty_generate(expected), File.read(@options[:changes_json])
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
