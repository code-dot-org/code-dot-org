require_relative '../test_helper'
require 'cdo/yaml'

class YamlTest < Minitest::Test
  def test_parse_yaml_header
    content = <<~CONTENT
      ---
      key: value
      ---

      body content
    CONTENT

    header, body = YAML.parse_yaml_header(content)
    assert_equal({"key" => "value"}, header)
    assert_equal "body content\n", body
  end

  def test_parse_yaml_header_erb_support
    content = <<~CONTENT
      ---
      key: <%= value %>
      ---

      body content
    CONTENT

    # undefined local variables will throw an error
    assert_raises NameError do
      YAML.parse_yaml_header(content)
    end

    header, body = YAML.parse_yaml_header(content, {value: "foo"})
    assert_equal({"key" => "foo"}, header)
    assert_equal "body content\n", body
  end
end
