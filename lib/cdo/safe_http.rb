require 'ipaddr'
require 'net/http'
require 'socket'
require 'uri'

# Shared helpers for outbound HTTP that validate the destination IP (SSRF)
# and pin the TCP connection to that resolved address (DNS rebinding).
module SafeHttp
  def self.public_ip_address?(ip_address)
    (
      !ip_address.link_local? &&
      !ip_address.loopback? &&
      !ip_address.private? &&
      !IPAddr.new('0.0.0.0/8').include?(ip_address)
    )
  end

  # SECURITY FIX: Resolve hostname once and return the IP string if it is
  # public, or equal to one of allow_ips. Callers should pass this IP to
  # http_client so the TCP connect cannot be redirected by a later DNS change
  # (DNS rebinding). Returns nil if the address is not allowed. Raises
  # SocketError if DNS lookup fails.
  def self.resolved_ip_address(hostname, allow_ips: [])
    host_ip_address = IPAddr.new(IPSocket.getaddress(hostname))
    allowed_ips = Array(allow_ips).map {|ip| ip.is_a?(IPAddr) ? ip : IPAddr.new(ip.to_s)}
    return host_ip_address.to_s if public_ip_address?(host_ip_address) || allowed_ips.include?(host_ip_address)

    nil
  end

  # SECURITY FIX: Build a Net::HTTP client that keeps url.host for TLS/SNI
  # and the Host header, but connects to resolved_ip_address (from
  # resolved_ip_address) to prevent a DNS race between validation and connect.
  def self.http_client(url, resolved_ip_address, open_timeout: 3, read_timeout: 3)
    http = Net::HTTP.new(url.host, url.port)
    http.use_ssl = url.scheme == 'https'
    http.open_timeout = open_timeout
    http.read_timeout = read_timeout

    http.instance_variable_set(:@ipaddr, resolved_ip_address)
    def http.conn_address
      @ipaddr
    end

    http
  end

  def self.request_path(url)
    path = url.path.empty? ? '/' : url.path
    query = url.query || ''
    query.empty? ? path : "#{path}?#{query}"
  end
end
