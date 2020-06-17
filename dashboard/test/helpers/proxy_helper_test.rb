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

  test 'allows hostname resolving to public IP address' do
    assert allowed_ip_address?('google.com')
  end

  test 'allows public IP address provided as hostname' do
    assert allowed_ip_address?('8.8.8.8')
  end

  test 'allows private IP that is the same as dashboard IP' do
    private_ip_address_string = '127.0.0.1'
    private_ip_address = IPAddr.new(private_ip_address_string)
    CDO.stubs(:dashboard_hostname).returns(private_ip_address_string)
    ProxyHelper.stubs(:dashboard_ip_address).returns(private_ip_address)
    assert allowed_ip_address?(private_ip_address_string)
  end

  test 'disallows hostname resolving to private IP address' do
    hostname = 'resolves.to.private.ip.example.net'

    IPSocket.expects(:getaddress).with(hostname).returns('169.254.0.0')
    ProxyHelper.stubs(:dashboard_ip_address).returns('127.0.0.1')
    refute allowed_ip_address?('resolves.to.private.ip.example.net')
  end

  test 'disallows private IP address provided as hostname' do
    refute allowed_ip_address?('169.254.0.0')
  end

  test '0.0.0.1 is not a public ip address' do
    refute public_ip_address?(IPAddr.new('0.0.0.1'))
  end

  test '169.254.0.0 is not a public ip address' do
    refute public_ip_address?(IPAddr.new('169.254.0.0'))
  end

  test '127.0.0.1 is not a public ip address' do
    refute public_ip_address?(IPAddr.new('127.0.0.0'))
  end

  test '192.168.0.1 is not a public ip address' do
    refute public_ip_address?(IPAddr.new('192.168.0.1'))
  end

  # OpenDNS server
  test '208.67.220.220 is a public ip address' do
    assert public_ip_address?(IPAddr.new('208.67.220.220'))
  end

  # Google DNS server's IPv6 address
  test '2001:4860:4860::8888 is a public ip address' do
    assert public_ip_address?(IPAddr.new('2001:4860:4860::8888'))
  end
end
