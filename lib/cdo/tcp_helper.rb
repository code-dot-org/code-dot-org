require 'socket'
require 'resolv'
require 'ipaddr'

module Cdo
  module TCPHelper
    # Return the fastest-responding address among all
    # resolved IP addresses within the specified subnet,
    def self.fastest_in_subnet(*hosts, subnet: nil, port: 80, timeout: 1)
      subnet ||= private_subnet
      ips_in_range = addresses(*hosts).select {|ip| subnet === ip}
      fastest(*ips_in_range, port: port, timeout: timeout)
    end

    # Returns a subnet containing the host's private IPv4 address.
    def self.private_subnet(prefix: 24)
      return nil unless (local_ip = Socket.ip_address_list.find(&:ipv4_private?)&.ip_address)
      IPAddr.new(local_ip).tap {|ip| ip.prefix = prefix}
    end

    # Resolve an array of IPv4 addresses from an array of domains, in parallel.
    def self.addresses(*domains)
      domains.map do |domain|
        Thread.new {resolve domain}
      end.map(&:value).flatten
    end

    # Recursively resolve CNAME entries to get an array of A addresses.
    def self.resolve(domain)
      return domain if domain =~ Resolv::IPv4::Regex
      Resolv::DNS.open do |dns|
        loop do
          domain = dns.getresource(domain, Resolv::DNS::Resource::IN::CNAME)&.name.to_s
        end
      rescue Resolv::ResolvError # No more CNAME, get A
        dns.getresources(domain, Resolv::DNS::Resource::IN::A).map(&:address).map(&:to_s)
      end
    end

    # Check TCP connectivity of several addresses in parallel,
    # returning the address of the first established connection.
    # Raises the last exception if all addresses fail to connect.
    def self.fastest(*addresses, port: 80, timeout: 1)
      return nil if addresses.empty?
      results = Queue.new
      exceptions = 0
      addresses.each do |address|
        Thread.new {results << check(address, port, timeout: timeout)}
      end
      while (result = results.pop)
        break unless result.is_a?(Exception)
        raise result if (exceptions += 1) >= addresses.length
      end
      result
    end

    # Check TCP connectivity by establishing a TCP connection.
    # Return address on success or Exception on error.
    def self.check(address, port, timeout:)
      Socket.tcp(address, port, connect_timeout: timeout) {address}
    rescue => e
      e
    end
  end
end
