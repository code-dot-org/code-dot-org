require 'test_helper'

class UrlValidatorTest < ActiveSupport::TestCase
  include Pd::UrlValidator

  test 'valid_url? returns true for valid http URL' do
    assert self.class.valid_url?('http://example.com')
  end

  test 'valid_url? returns true for valid https URL' do
    assert self.class.valid_url?('https://example.com')
  end

  test 'valid_url? returns false for invalid URL' do
    refute self.class.valid_url?('invalid-url')
  end

  test 'valid_url? returns false for non-http/https URL when skip_protocol_check is false' do
    refute self.class.valid_url?('ftp://example.com')
  end

  test 'valid_url? returns true for non-http/https URL when skip_protocol_check is true' do
    assert self.class.valid_url?('ftp://example.com', true)
  end

  test 'valid_url? returns false for missing protocol URL when skip_protocol_check is false' do
    refute self.class.valid_url?('example.com')
  end

  test 'valid_url? returns true for missing protocol URL when skip_protocol_check is true' do
    assert self.class.valid_url?('example.com', true)
  end

  test 'valid_url? returns false for empty string' do
    refute self.class.valid_url?('')
  end

  test 'valid_url? returns false for nil' do
    refute self.class.valid_url?(nil)
  end
end
