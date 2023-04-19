require_relative '../test_helper'

require 'cdo/legacy_varnish_helpers'

class LegacyVarnishHelpersTest < Minitest::Test
  HEADERS = LegacyVarnishHelpers::REMOVED_HEADERS.map {|x| x.split(':')[0]}.freeze
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

  def ruby_behavior(config, path)
    LegacyVarnishHelpers.behavior_for_path(config[:behaviors] + [config[:default]], path)
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
