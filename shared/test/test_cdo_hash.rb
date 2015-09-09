require 'minitest/autorun'
require 'rack/test'

require 'yaml'
require File.expand_path '../../../lib/cdo/hash', __FILE__

class CdoHashTest < Minitest::Test
  def test_deep_sort
    one = {y: {x: 'x', b: 'i', r: 't'}, c: 'o'}
    two = {c: 'o', y: {x: 'x', r: 't', b: 'i'}}

    assert_equal one, two
    assert one.to_yaml != two.to_yaml
    assert_equal one.deep_sort, two.deep_sort
    assert_equal one.deep_sort.to_yaml, two.deep_sort.to_yaml
  end
end
