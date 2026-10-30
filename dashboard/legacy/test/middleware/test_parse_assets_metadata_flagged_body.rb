require_relative 'middleware_test_helper' # Must be required first to establish load paths
require_relative '../../middleware/files_api'
require_relative '../../middleware/helpers/bucket_helper'
require_relative '../../middleware/helpers/file_bucket'

# Focused unit tests for FilesApi#parse_assets_metadata_flagged_body.
class ParseAssetsMetadataFlaggedBodyTest < Minitest::Test
  def setup
    @api = FilesApi.new!
  end

  def test_accepts_valid_filename
    body = {filename: 'bad.png'}.to_json
    assert_equal({filename: 'bad.png'}.to_json, @api.parse_assets_metadata_flagged_body(body))
  end

  def test_drops_extra_keys
    body = {filename: 'bad.png', extra: 'nope'}.to_json
    assert_equal({filename: 'bad.png'}.to_json, @api.parse_assets_metadata_flagged_body(body))
  end

  def test_rejects_nil_body
    assert_raises(ArgumentError) {@api.parse_assets_metadata_flagged_body(nil)}
  end

  def test_rejects_oversized_body
    body = 'x' * (FilesApi::ASSETS_METADATA_FLAGGED_MAX_BYTES + 1)
    assert_raises(ArgumentError) {@api.parse_assets_metadata_flagged_body(body)}
  end

  def test_rejects_invalid_json
    assert_raises(ArgumentError) {@api.parse_assets_metadata_flagged_body('not-json')}
  end

  def test_rejects_non_object_json
    assert_raises(ArgumentError) {@api.parse_assets_metadata_flagged_body('[]')}
    assert_raises(ArgumentError) {@api.parse_assets_metadata_flagged_body('"x"')}
  end

  def test_rejects_missing_or_empty_filename
    assert_raises(ArgumentError) {@api.parse_assets_metadata_flagged_body({}.to_json)}
    assert_raises(ArgumentError) {@api.parse_assets_metadata_flagged_body({filename: ''}.to_json)}
    assert_raises(ArgumentError) {@api.parse_assets_metadata_flagged_body({filename: 1}.to_json)}
  end

  def test_rejects_path_separators
    assert_raises(ArgumentError) do
      @api.parse_assets_metadata_flagged_body({filename: 'a/b.png'}.to_json)
    end
    assert_raises(ArgumentError) do
      @api.parse_assets_metadata_flagged_body({filename: 'a\\b.png'}.to_json)
    end
  end

  def test_rejects_unsafe_characters
    assert_raises(ArgumentError) do
      @api.parse_assets_metadata_flagged_body({filename: 'bad name.png'}.to_json)
    end
  end

  def test_rejects_too_long_filename
    filename = ('a' * (FileBucket::MAXIMUM_FILENAME_LENGTH + 1)) + '.png'
    assert_raises(ArgumentError) do
      @api.parse_assets_metadata_flagged_body({filename: filename}.to_json)
    end
  end
end
