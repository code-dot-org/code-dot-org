require_relative '../test_helper'
require 'cdo/config'
require 'tempfile'

class ConfigTest < Minitest::Test
  def test_load_configuration
    config = Cdo::Config.new
    assert_nil config.key
    config.load_configuration({key: 'value', nil_key: nil})
    assert_equal 'value', config.key
    file = Tempfile.new(%w(config .yml))
    file.write <<YAML
key: new
a: b
nil_key: new
YAML
    file.close
    config.load_configuration(file)
    assert_equal 'value', config.key
    assert_equal 'b', config.a
    assert_nil config.nil_key
  end

  def test_erb
    file = Tempfile.new(%w(config .yml.erb))
    file.write <<YAML
x: y
a: foo
b: <%=a%>bar
c: <%=b%>baz
YAML
    file.close

    config = Cdo::Config.new
    config.load_configuration(file.path)
    exp = {
      x: 'y',
      a: 'foo',
      b: 'foobar',
      c: 'foobarbaz'
    }
    assert_equal(exp, config.to_h)
  end

  def test_circular_dependency
    file = Tempfile.new(%w(config .yml.erb))
    file.write <<YAML
a: foo<%=b%>
b: <%=a%>bar
YAML
    file.close
    assert_raises(RuntimeError) do
      Cdo::Config.new.load_configuration(file.path)
    end
  end

  def test_freeze
    config = Cdo::Config.new
    config.load_configuration(x: 'y')
    config.x = 'z'
    config.freeze
    assert_equal 'z', config.x
    assert_raises(RuntimeError) {config.x = 'a'}
    assert_raises(ArgumentError) {config.y}
  end
end
