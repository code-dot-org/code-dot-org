require 'minitest/autorun'
require 'rack/test'

require_relative '../../lib/cdo/env'

class ENVTest < Minitest::Test

  def test_redact_sensitive_values
    ENV['SAFE'] = 'safe value'
    ENV['AWS_SECRET_KEY'] = 'this should be obfuscated'

    redacted = ENV.redact_sensitive_values

    assert redacted.has_key? 'SAFE'
    assert_equal 'safe value', redacted['SAFE']

    assert redacted.has_key? 'AWS_SECRET_KEY'
    assert_equal '(HIDDEN)', redacted['AWS_SECRET_KEY']
  end
end
