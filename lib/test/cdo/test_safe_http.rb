require_relative '../test_helper'
require 'cdo/safe_http'
require 'ipaddr'

class SafeHttpTest < Minitest::Test
  def test_public_ip_address_rejects_restricted_ranges
    refute SafeHttp.public_ip_address?(IPAddr.new('0.0.0.1'))
    refute SafeHttp.public_ip_address?(IPAddr.new('169.254.0.0'))
    refute SafeHttp.public_ip_address?(IPAddr.new('127.0.0.1'))
    refute SafeHttp.public_ip_address?(IPAddr.new('192.168.0.1'))
    refute SafeHttp.public_ip_address?(IPAddr.new('10.0.0.5'))
  end

  def test_public_ip_address_allows_public_addresses
    assert SafeHttp.public_ip_address?(IPAddr.new('208.67.220.220'))
    assert SafeHttp.public_ip_address?(IPAddr.new('2001:4860:4860::8888'))
  end

  def test_resolved_ip_address_returns_public_ip_string
    IPSocket.expects(:getaddress).with('images.example.com').returns('203.0.113.10')
    assert_equal '203.0.113.10', SafeHttp.resolved_ip_address('images.example.com')
  end

  def test_resolved_ip_address_returns_nil_for_private_ip
    IPSocket.expects(:getaddress).with('internal.example').returns('10.0.0.5')
    assert_nil SafeHttp.resolved_ip_address('internal.example')
  end

  def test_resolved_ip_address_allows_explicit_allow_ips
    IPSocket.expects(:getaddress).with('dashboard.example').returns('127.0.0.1')
    result = SafeHttp.resolved_ip_address('dashboard.example', allow_ips: [IPAddr.new('127.0.0.1')])
    assert_equal '127.0.0.1', result
  end

  def test_http_client_pins_conn_address
    url = URI.parse('https://images.example.com/a.png')
    http = SafeHttp.http_client(url, '203.0.113.10')

    assert_equal 'images.example.com', http.address
    assert_equal 443, http.port
    assert http.use_ssl?
    assert_equal '203.0.113.10', http.conn_address
    assert_equal 3, http.open_timeout
    assert_equal 3, http.read_timeout
  end

  def test_request_path_includes_query_string
    url = URI.parse('https://images.example.com/a.png?x=1')
    assert_equal '/a.png?x=1', SafeHttp.request_path(url)
  end

  def test_request_path_defaults_empty_path_to_slash
    url = URI.parse('https://images.example.com')
    assert_equal '/', SafeHttp.request_path(url)
  end
end
