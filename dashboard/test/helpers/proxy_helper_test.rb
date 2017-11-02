require 'test_helper'

class ProxyHelperTest < ActionView::TestCase
  include Devise::Test::ControllerHelpers

  ALLOWED_HOSTNAME_SUFFIXES = %w[
    foo.com
    bar.org
  ]

  test 'allows hostname matching full domain suffix' do
    assert allowed_hostname?(URI.parse('http://foo.com/'), ALLOWED_HOSTNAME_SUFFIXES)
    assert allowed_hostname?(URI.parse('http://foo.com/api'), ALLOWED_HOSTNAME_SUFFIXES)
    assert allowed_hostname?(URI.parse('http://bar.org/'), ALLOWED_HOSTNAME_SUFFIXES)
  end

  test 'allows hostname matching subdomain suffix at word boundaries' do
    assert allowed_hostname?(URI.parse('http://foo.bar.org/'), ALLOWED_HOSTNAME_SUFFIXES)
  end

  test 'disallows hostname matching subdomain suffix at subword boundaries' do
    refute allowed_hostname?(URI.parse('http://foobar.org/'), ALLOWED_HOSTNAME_SUFFIXES)
    refute allowed_hostname?(URI.parse('http://foo-bar.org/'), ALLOWED_HOSTNAME_SUFFIXES)
  end
end
