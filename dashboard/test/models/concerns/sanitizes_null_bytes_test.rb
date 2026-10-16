require 'test_helper'

class SanitizesNullBytesTest < ActiveSupport::TestCase
  # Referenced from the concern's own constant so no literal NUL byte is typed into this source file.
  NUL = SanitizesNullBytes::NULL_BYTE

  def mock_column(name, type)
    stub(name: name, type: type)
  end

  # A throwaway model backed by a real table (aichat_requests: json + text + integer + datetime
  # columns) so column-type detection runs against a genuine schema.
  def build_model(&block)
    Class.new(ApplicationRecord) do
      self.table_name = 'aichat_requests'
      include SanitizesNullBytes
      class_eval(&block) if block
    end
  end

  describe '.deep_strip_null_bytes' do
    it 'removes NUL from a bare string' do
      _(SanitizesNullBytes.deep_strip_null_bytes("a#{NUL}b#{NUL}")).must_equal 'ab'
    end

    it 'recurses through nested hashes and arrays, leaving non-strings untouched' do
      input = {
        'text' => "hi#{NUL}there",
        'assets' => ["x#{NUL}", {'caption' => "c#{NUL}d"}],
        'count' => 3,
        'flag' => true,
        'missing' => nil,
      }
      _(SanitizesNullBytes.deep_strip_null_bytes(input)).must_equal(
        {
          'text' => 'hithere',
          'assets' => ['x', {'caption' => 'cd'}],
          'count' => 3,
          'flag' => true,
          'missing' => nil,
        }
      )
    end

    it 'returns the identical string object when there is no NUL (cheap no-op signal)' do
      clean = 'nothing to strip'
      _(SanitizesNullBytes.deep_strip_null_bytes(clean)).must_be_same_as clean
    end

    it 'preserves tab, newline, and carriage return' do
      _(SanitizesNullBytes.deep_strip_null_bytes("a\tb\nc\r")).must_equal "a\tb\nc\r"
    end
  end

  describe '.null_byte_sanitizable_columns' do
    it 'selects text/json columns and excludes string, binary, and non-textual types' do
      model = build_model
      model.stubs(:columns).returns(
        [
          mock_column('name', :string),  # VARCHAR - skipped (covered by Redshift ACCEPTINVCHARS)
          mock_column('body', :text),
          mock_column('payload', :json),
          mock_column('avatar', :binary),
          mock_column('count', :integer),
          mock_column('created_at', :datetime),
        ]
      )
      model.instance_variable_set(:@null_byte_sanitizable_columns, nil)

      _(model.null_byte_sanitizable_columns).must_equal %w[body payload]
    end

    it 'honors skip_null_byte_sanitization exemptions' do
      model = build_model {skip_null_byte_sanitization :response}

      _(model.null_byte_sanitizable_columns).wont_include 'response'
      _(model.null_byte_sanitizable_columns).must_include 'new_message'
    end

    it 'derives the real columns of the backing table' do
      _(build_model.null_byte_sanitizable_columns.to_set).must_equal(
        %w[model_customizations stored_messages new_message response].to_set
      )
    end
  end
end
