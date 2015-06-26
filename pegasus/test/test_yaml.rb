require_relative '../../lib/cdo/pegasus'
require_relative '../../lib/cdo/yaml'
require 'minitest/autorun'

class YamlTest < Minitest::Unit::TestCase

  def test_markdown_no_front_matter
    content = """
    # This is some markdown content
    a|a|a|a
    a: b
    a: true
    --
    -
"""
    head, body = YAML.parse_yaml_header(content)
    assert_equal({}, head)
    assert_equal(content, body)
  end

  def test_markdown_with_front_matter
    content = """
---
a: b
b: 1
c: true
some long variable name: also works
---
# This is some markdown content
"""
    head, body = YAML.parse_yaml_header(content)
    assert_equal({'a' => 'b', 'b' => 1, 'c' => true, 'some long variable name' => 'also works'}, head)
    assert_equal("# This is some markdown content\n", body)
  end

end
