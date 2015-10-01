require 'minitest/autorun'
require '../../cookbooks/cdo-varnish/libraries/helpers'

# Unit tests for cdo-varnish/libraries/helpers.rb
class VarnishHelperTest < Minitest::Test

  def test_paths_to_regex
    ext_regex = paths_to_regex('*.jpg')
    assert_equal 'req.url ~ "(\.jpg)(\?.*)?$"', ext_regex

    assert_equal ext_regex, paths_to_regex(['*.jpg'])
    # extension-wildcard with leading slash allowed
    assert_equal ext_regex, paths_to_regex('/*.jpg')

    exts_regex = paths_to_regex(%w(*.jpg *.png))
    assert_equal 'req.url ~ "(\.jpg|\.png)(\?.*)?$"', exts_regex

    path_regex = paths_to_regex(%w(path1/* path2/*))
    assert_equal 'req.url ~ "^/path1/" || req.url ~ "^/path2/"',  path_regex

    # Test invalid path patterns:
    [
      # Unsupported extension wildcards
      '/images/*.jpg',
      '/a??.jpg',
      '/a*.jpg',
      # Wildcard-extension
      '/*.doc*',
      # Path with wildcard subexpression
      '/assets/*/images',
      # Extension-wildcard containing path delimiter
      '*/images',
      # Wildcard at both ends
      '*images*',
      # Maximum path length
      ('a' * 260) + '/*'
    ].map do |path|
      assert_raises(ArgumentError) { paths_to_regex path }
    end
  end

  def test_if_else
    items = %w(a b c d)
    condition = lambda do |x|
      # False condition is removed entirely.
      return false if x == 'b'
      # Nil condition at end of list turns into 'else'.
      return nil if x == 'd'
      "#{x} == true"
    end
    output = if_else(items, condition){|x|x}
    assert_equal <<STR, output
if (a == true) {
  a
} else if (c == true) {
  c
} else {
  d
}
STR
  end
end
