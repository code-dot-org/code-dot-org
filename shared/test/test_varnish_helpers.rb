require 'minitest/autorun'
require_relative '../../cookbooks/cdo-varnish/libraries/helpers'

# Unit tests for cdo-varnish/libraries/helpers.rb
class VarnishHelperTest < Minitest::Test

  def test_paths_to_regex
    ext_regex = paths_to_regex('/*.jpg')
    assert_equal 'req.url ~ "(\.jpg)(\?.*)?$"', ext_regex

    assert_equal ext_regex, paths_to_regex(['/*.jpg'])

    exts_regex = paths_to_regex(%w(/*.jpg /*.png))
    assert_equal 'req.url ~ "(\.jpg|\.png)(\?.*)?$"', exts_regex

    path_regex = paths_to_regex(%w(/path1/* /path2/*))
    assert_equal 'req.url ~ "^/path1/" || req.url ~ "^/path2/"',  path_regex
  end

  def test_invalid_path_patterns
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
      '/*images*',
      # Maximum path length
      '/' + ('a' * 260) + '/*',
      '/[]/*',
      '/()/*',
    ].map do |path|
      assert_raises(ArgumentError) { paths_to_regex path }
    end
  end

  def test_reuse_paths
    reuse_path = '/api/*'
    paths_to_regex reuse_path
    paths_to_regex reuse_path

    reuse_array = %w(/1* /2*)
    paths_to_regex reuse_array
    paths_to_regex reuse_array
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
    assert_equal <<STR.strip, output
if (a == true) {
  a
} else if (c == true) {
  c
} else {
  d
}
STR
  end

  BEHAVIOR = {
    dashboard: {
      behaviors: [],
      default: {cookies: 'all'}
    },
    pegasus: {
      behaviors: [{
          path: '/api/*',
          cookies: 'all'
        }],
      default: {cookies: 'none'}
    }
  }

  def test_setup_behavior
    output = setup_behavior BEHAVIOR
    assert_equal <<STR.strip, output
if (req.http.host ~ "(dashboard|studio).code.org$") {
  # Allow all request cookies.
} else {
  if (req.url ~ "^/api/") {
    # Allow all request cookies.
  } else {
    cookie.filter_except("NO_CACHE");
  }
}
STR
    output = setup_behavior BEHAVIOR, 'response'
    assert_equal <<STR.strip, output
if (bereq.http.host ~ "(dashboard|studio).code.org$") {
  # Allow set-cookie responses.
} else {
  if (bereq.url ~ "^/api/") {
    # Allow set-cookie responses.
  } else {
    unset beresp.http.set-cookie;
  }
}
STR
  end

  def ruby_behavior(config, path)
    behavior_for_path(config[:behaviors] + [config[:default]], path)
  end

  def test_ruby_behavior
    dashboard = BEHAVIOR[:dashboard]
    pegasus = BEHAVIOR[:pegasus]
    assert_equal 'all', ruby_behavior(dashboard, '/api/')[:cookies]
    assert_equal 'all', ruby_behavior(pegasus, '/api/')[:cookies]
    assert_equal 'none', ruby_behavior(pegasus, '/')[:cookies]

    assert_equal '/api/*', ruby_behavior(pegasus, '/api/1')[:path]
    assert_nil ruby_behavior(pegasus, 'api/1')[:path]
    assert_nil ruby_behavior(pegasus, '/test/api/1')[:path]
  end
end
