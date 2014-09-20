require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'

class ObjectTest < Minitest::Unit::TestCase
  def test_nil_or_empty
    assert nil.nil_or_empty?
    assert ''.nil_or_empty?
    assert [].nil_or_empty?
    assert ({}).nil_or_empty?

    assert !('a'.nil_or_empty?)
    assert !([1].nil_or_empty?)
    assert !(({a: 1}).nil_or_empty?)
  end
end
