require_relative '../test_helper'

require 'cdo/cdo_cli'

class CdoCliTest < Minitest::Test
  def test_unindent_with_min_zero
    s = "abc\n  def\n   ghi"
    assert_equal s, s.unindent
  end

  def test_unindent_with_min_positive
    assert_equal(
      "abc\n  def\n    ghi",
      "  abc\n    def\n      ghi".unindent
    )
  end

  def test_unindent_with_tabs_and_spaces
    assert_equal(
      "abc\n\t def\n\t \t ghi",
      "\t abc\n\t \t def\n\t \t \t ghi".unindent
    )
  end

  def test_unindent_with_one_line
    assert_equal 'abc', '  abc'.unindent
  end

  def test_unindent_with_indent_with_indent_zero
    assert_equal(
      "abc\n  def\n    ghi",
      "  abc\n    def\n      ghi".unindent_with_indent(0)
    )
  end

  def test_unindent_with_indent_with_indent_small
    assert_equal(
      "  abc\n    def\n      ghi",
      "    abc\n      def\n        ghi".unindent_with_indent(2)
    )
  end

  def test_unindent_with_indent_with_indent_large
    assert_equal(
      "    abc\n      def\n        ghi",
      "  abc\n    def\n      ghi".unindent_with_indent(4)
    )
  end
end
