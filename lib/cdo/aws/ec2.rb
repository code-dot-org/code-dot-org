require 'net/http'
require 'uri'
require 'active_support/core_ext/integer/time'

module AWS
  module EC2
    METADATA_IP = '169.254.169.254'.freeze
    TOKEN_URL = "http://#{METADATA_IP}/latest/api/token".freeze
    METADATA_URL = "http://#{METADATA_IP}/latest/meta-data/".freeze

    REQUEST_TIMEOUT = 5
    TOKEN_TTL = 6.hours

    def self.instance_id
      return @instance_id if defined?(@instance_id) && @instance_id
      # Fetch metadata and fall back to nil if unreachable
      @instance_id = fetch_metadata('instance-id')
    end

    def self.region
      return @region if defined?(@region) && @region
      @region = fetch_metadata('placement/region')
    end

    private_class_method def self.fetch_metadata(path)
      token = fetch_token
      return nil unless token # IMDSv2 requires a token; fail if not obtained

      uri = URI.join(METADATA_URL, path)
      response = http_request(Net::HTTP::Get, uri, {'X-aws-ec2-metadata-token' => token})

      # Ensure we return nil for 404s or other non-200 responses
      response&.code == '200' ? response.body : nil
    end

    private_class_method def self.fetch_token
      uri = URI(TOKEN_URL)
      headers = {'X-aws-ec2-metadata-token-ttl-seconds' => TOKEN_TTL.to_s}

      response = http_request(Net::HTTP::Put, uri, headers)
      response&.code == '200' ? response.body : nil
    end

    private_class_method def self.http_request(method_class, uri, headers = {})
      http = Net::HTTP.new(uri.host, uri.port)
      http.open_timeout = REQUEST_TIMEOUT
      http.read_timeout = REQUEST_TIMEOUT

      request = method_class.new(uri.path)
      headers.each {|k, v| request[k] = v}

      http.request(request)
    rescue StandardError => exception
      Honeybadger.notify(exception) if defined?(Honeybadger)
      nil
    end
  end
end
