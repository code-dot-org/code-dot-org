#!/usr/bin/env ruby

require 'socket'
require 'timeout'

require_relative '../../dashboard/config/environment'

# This script inspects all cache entries in the partial registration namespace for the presence of a TTL.
# If no TTL is present, the cache entry is removed.
DRY_RUN = true

puts "Processing... DRYRUN=#{DRY_RUN}"

PARTIAL_REGISTRATION_SUFFIXES = [
  /-partial-sso-migrated$/,
  /-partial-sso$/,
  /-partial-email$/
]

all_keys_without_expiration = []

dalli_data = CDO.shared_cache.instance_variable_get(:@data)
memcached_endpoints = dalli_data.instance_variable_get(:@servers)

puts "Found endpoints #{memcached_endpoints}"

memcached_endpoints.each do |endpoint|
  hostname, port = endpoint.split(":")

  puts "Checking #{hostname} #{port}"
  sock = TCPSocket.new(hostname, 11211)

  begin
    # metadump doesn't return END in our version of memcached, wait 30 seconds for all output instead
    # https://github.com/memcached/memcached/issues/667
    Timeout.timeout(30) do
      sock.write("lru_crawler metadump all\r\n")

      # read keys until encountered an end (for memcached, this will be the Timeout)
      loop do
        data = sock.readline
        break if !data || data.empty? || data == "END\r\n" || data == "ERROR\r\n"
        matches = data.scan(/^key=(?<key>.*) exp=-1/)
        next if matches.empty?
        all_keys_without_expiration.concat(matches.flatten!)
      end
    end
  rescue EOFError
    puts "Connection closed by remote host."
  rescue Errno::EAGAIN, Errno::EWOULDBLOCK, Timeout::Error
    puts "Timeout reached while waiting for data."
  ensure
    sock.close
  end
end

# Filter strings that match any of the regexes
partial_registration_keys = all_keys_without_expiration.select do |string|
  PARTIAL_REGISTRATION_SUFFIXES.any? {|regex| regex.match?(string)}
end

puts "Filtered keys:"
puts partial_registration_keys

unless DRY_RUN
  partial_registration_keys.each do |key|
    CDO.shared_cache.delete(key)
    puts "Removed key #{key}"
  end
end
