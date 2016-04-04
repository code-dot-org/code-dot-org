require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'

class StringTest < Minitest::Test
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
    assert_equal %w(ac ad bc bd), String.multiply_concat(%w(a b), %w(c d))
  end

  def test_to_bool
    %w(true t yes y 1).each{|true_value| assert true_value.to_bool}
    ['', 'false','f','no','n','0'].each{|false_value| assert !false_value.to_bool}
  end

  def test_utf8_to_iso_8859
    iso_8859_string = "ISO-8859 test \xE0" # Includes an à in ISO-8859-1
    assert_raises ArgumentError do
      # .gsub on an ISO-8859-1 encoded string throws an error
      iso_8859_string.gsub(/test regex/, 'replacement')
    end

    forced_string = iso_8859_string.force_8859_to_utf8
    assert_equal('ISO-8859 test à', forced_string)
    assert_equal('ISO-8859 replacement à', forced_string.gsub(/test/, 'replacement'))
    assert_equal('normal string', 'normal string'.force_8859_to_utf8)
    assert_equal('UTF-8sπ´å™£¢∞¡™£', 'UTF-8sπ´å™£¢∞¡™£'.force_8859_to_utf8)
  end
end
