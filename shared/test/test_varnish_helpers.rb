require_relative 'test_helper'
require_relative '../../cookbooks/cdo-varnish/libraries/helpers'

# Unit tests for cdo-varnish/libraries/helpers.rb
class VarnishHelperTest < Minitest::Test
  def test_paths_to_regex
    ext_regex = paths_to_regex('/*.jpg')
    assert_equal "req.url ~ \"^.*\\.jpg#{END_URL_REGEX}\"", ext_regex

    assert_equal ext_regex, paths_to_regex(['/*.jpg'])

    exts_regex = paths_to_regex(%w(/*.jpg /*.png))
    assert_equal "req.url ~ \"^.*\\.jpg#{END_URL_REGEX}\" || req.url ~ \"^.*\\.png#{END_URL_REGEX}\"", exts_regex

    path_regex = paths_to_regex(%w(/path1/* /path2/*))
    assert_equal "req.url ~ \"^/path1/.*#{END_URL_REGEX}\" || req.url ~ \"^/path2/.*#{END_URL_REGEX}\"",  path_regex
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
      assert_raises(ArgumentError, "Path did not raise error: #{path}") {paths_to_regex path}
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
    output = if_else(items, condition) {|x| x}
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
  HEADERS = REMOVED_HEADERS.map {|x| x.split(':')[0]}.freeze
  BEHAVIOR = {
    dashboard: {
      behaviors: [],
      default: {cookies: 'all', query: true, headers: HEADERS}
    },
    pegasus: {
      behaviors: [
        {
          path: '/api/*',
          headers: HEADERS,
          query: true,
          cookies: 'all'
        },
        {
          path: '/',
          headers: HEADERS,
          query: nil, # default true
          cookies: ['1']
        }
      ],
      default: {cookies: 'none', headers: HEADERS, query: false}
    }
  }.freeze

  def test_setup_behavior
    output = setup_behavior(BEHAVIOR, 'req', &method(:process_request))
    assert_equal <<STR.strip, output
if (req.http.host ~ "(dashboard|studio)") {
  # Allow all request cookies.
} else {
  if (req.url ~ "^/api/.*#{END_URL_REGEX}") {
    # Allow all request cookies.
  } else if (req.url ~ "^/#{END_URL_REGEX}") {
    if(cookie.isset("1")) {
      set req.http.X-COOKIE-1 = cookie.get("1");
    }
    cookie.filter_except("1");
  } else {
    cookie.filter_except("NO_CACHE");
    set req.url = regsub(req.url, \"\\?.*$\", \"\");
  }
}
STR
    output = setup_behavior(BEHAVIOR, 'bereq', &method(:process_response))
    assert_equal <<STR.strip, output
if (bereq.http.host ~ "(dashboard|studio)") {
  # Allow set-cookie responses.
} else {
  if (bereq.url ~ "^/api/.*#{END_URL_REGEX}") {
    # Allow set-cookie responses.
  } else if (bereq.url ~ "^/#{END_URL_REGEX}") {
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
    assert_equal ['1'], ruby_behavior(pegasus, '/')[:cookies]
    assert_equal 'none', ruby_behavior(pegasus, '/something')[:cookies]

    assert_equal '/api/*', ruby_behavior(pegasus, '/api/1')[:path]
    assert_nil ruby_behavior(pegasus, 'api/1')[:path]
    assert_nil ruby_behavior(pegasus, '/test/api/1')[:path]

    assert_nil ruby_behavior(pegasus, '/test/api/1')[:path]
  end
end
