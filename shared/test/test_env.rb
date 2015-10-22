require 'minitest/autorun'
require 'rack/test'

require_relative '../../lib/cdo/env'

class ENVTest < Minitest::Test

  def test_with_sensitive_values_redacted
    ENV['SAFE'] = 'safe value'
    orig_key = ENV['AWS_SECRET_KEY']
    ENV['AWS_SECRET_KEY'] = 'this should be obfuscated'

    redacted = ENV.with_sensitive_values_redacted

    assert redacted.has_key? 'SAFE'
    assert_equal 'safe value', redacted['SAFE']

    assert redacted.has_key? 'AWS_SECRET_KEY'
    assert_equal '(HIDDEN)', redacted['AWS_SECRET_KEY']

    ENV['AWS_SECRET_KEY'] = orig_key
  end
end
