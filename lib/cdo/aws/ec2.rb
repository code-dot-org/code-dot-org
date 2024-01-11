require 'net/http'
require 'uri'

module AWS
  module EC2
    REQUEST_TIMEOUT = 10 # seconds

    INSTANCE_ID_URI = URI('http://169.254.169.254/latest/meta-data/instance-id').freeze
    REGION_URI = URI('http://169.254.169.254/latest/meta-data/placement/region').freeze

    def self.instance_id
      return @instance_id if defined? @instance_id
      @instance_id = http_get(INSTANCE_ID_URI)
    end

    def self.region
      return @region if defined? @region
      @region = http_get(REGION_URI)
    end

    private_class_method def self.http_get(uri)
      http = Net::HTTP.new(uri.host, uri.port)

      # Sets a short timeout to fail faster when it is not executed on an EC2 Instance
      http.open_timeout = REQUEST_TIMEOUT
      http.read_timeout = REQUEST_TIMEOUT

      http.request_get(uri.path).body
    rescue Net::OpenTimeout # This code is not executing on an AWS EC2 Instance nor in an ECS container or Lambda.
      nil
    end
  end
end
