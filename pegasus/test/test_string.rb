require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'

class StringTest < Minitest::Unit::TestCase
  def test_end_with()
    assert 'hello world'.end_with?('hello world')
    assert 'hello world'.end_with?('')
    assert 'hello world'.end_with?('world')
    assert 'hello world'.end_with?(' world')
    assert 'hello world'.end_with?('o world')
    assert !('hello world'.end_with?('hello'))
    assert !('hello world'.end_with?('hello '))
    assert !('hello world'.end_with?('hello w'))
  end

  def test_include_one_of
    assert 'hello world'.include_one_of?('hello')
    assert 'hello world'.include_one_of?('lo wor')
    assert 'hello world'.include_one_of?('world')
    assert !('hello world'.include_one_of?('goodbye'))
  end

  def test_multiply_concat
    assert_equal ['ac', 'ad', 'bc', 'bd'], String.multiply_concat(['a','b'], ['c','d'])
  end

  def test_to_bool
    ['true','t','yes','y','1'].each{|true_value| assert true_value.to_bool}
    ['', 'false','f','no','n','0'].each{|false_value| assert !false_value.to_bool}
  end
end
