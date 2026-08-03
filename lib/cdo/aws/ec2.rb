require 'net/http'
require 'uri'
require 'json'
require 'aws-sdk-pricing'
require 'active_support/core_ext/integer/time'

module AWS
  module EC2
    METADATA_IP = '169.254.169.254'.freeze
    TOKEN_URL = "http://#{METADATA_IP}/latest/api/token".freeze
    METADATA_URL = "http://#{METADATA_IP}/latest/meta-data/".freeze

    REQUEST_TIMEOUT = 5
    TOKEN_TTL = 6.hours

    # The Price List Query API is only served from a few endpoints; us-east-1 is
    # always available regardless of where the instance itself runs.
    PRICING_ENDPOINT_REGION = 'us-east-1'

    def self.instance_id
      return @instance_id if defined?(@instance_id) && @instance_id
      # Fetch metadata and fall back to nil if unreachable
      @instance_id = fetch_metadata('instance-id')
    end

    def self.region
      return @region if defined?(@region) && @region
      @region = fetch_metadata('placement/region')
    end

    # EC2 instance type of the current instance (e.g. 'm5.xlarge'). nil off EC2.
    def self.instance_type
      return @instance_type if defined?(@instance_type) && @instance_type
      @instance_type = fetch_metadata('instance-type')
    end

    # Availability Zone of the current instance (e.g. 'us-east-1a'). nil off EC2.
    def self.availability_zone
      return @availability_zone if defined?(@availability_zone) && @availability_zone
      @availability_zone = fetch_metadata('placement/availability-zone')
    end

    # On-demand list price (USD/hour) for an instance type via the AWS Price List
    # Query API. Defaults to this instance's own type and region.
    #
    # This is a MODELED cost: the Price List API returns published on-demand list
    # prices and does NOT reflect Savings Plans, Reserved Instances, or Spot, so
    # it overstates what we actually pay where those discounts apply. It is meant
    # for a consistent cost-efficiency signal, not billing reconciliation.
    #
    # The price for a given (type, region) is effectively constant, so it is
    # resolved once and memoized. Returns nil if it can't be resolved (off EC2,
    # missing pricing:GetProducts IAM, unknown type, API error).
    #
    # @return [Float, nil]
    def self.hourly_rate(instance_type: nil, region: nil)
      instance_type ||= self.instance_type
      region ||= self.region
      return nil if instance_type.nil? || region.nil?

      key = [instance_type, region]
      @hourly_rates ||= {}
      return @hourly_rates[key] if @hourly_rates.key?(key)

      @hourly_rates[key] = fetch_hourly_rate(instance_type, region)
    end

    # Private IPv4 address of the current EC2 instance.
    def self.local_ipv4
      return @local_ipv4 if defined?(@local_ipv4) && @local_ipv4
      @local_ipv4 = fetch_metadata('local-ipv4')
    end

    # AWS Account ID of the compute resource (EC2, Lambda, ECS Task) that we're currently executing in.
    def self.account_id
      return @account_id if defined?(@account_id) && @account_id

      response = fetch_metadata('identity-credentials/ec2/info')
      return nil unless response

      begin
        parsed_info = JSON.parse(response)
        @account_id = parsed_info['AccountId']
      rescue JSON::ParserError
        nil
      end
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
      Observability::Errors.capture_exception(exception) if defined?(Observability::Errors)
      nil
    end

    private_class_method def self.pricing_client
      @pricing_client ||= Aws::Pricing::Client.new(region: PRICING_ENDPOINT_REGION)
    end

    # Filters narrow the catalog to a single Linux, shared-tenancy, no-bundled-
    # software, in-use on-demand offering for the type/region.
    private_class_method def self.fetch_hourly_rate(instance_type, region)
      response = pricing_client.get_products(
        service_code: 'AmazonEC2',
        filters: [
          {type: 'TERM_MATCH', field: 'instanceType', value: instance_type},
          {type: 'TERM_MATCH', field: 'regionCode', value: region},
          {type: 'TERM_MATCH', field: 'operatingSystem', value: 'Linux'},
          {type: 'TERM_MATCH', field: 'tenancy', value: 'Shared'},
          {type: 'TERM_MATCH', field: 'preInstalledSw', value: 'NA'},
          {type: 'TERM_MATCH', field: 'capacitystatus', value: 'Used'}
        ],
        max_results: 1
      )

      product = response.price_list.first
      return nil unless product

      parse_on_demand_usd(JSON.parse(product))
    rescue StandardError => exception
      Observability::Errors.capture_exception(exception) if defined?(Observability::Errors)
      nil
    end

    # Walks terms.OnDemand.*.priceDimensions.*.pricePerUnit.USD and returns the
    # first positive rate found.
    private_class_method def self.parse_on_demand_usd(product)
      on_demand = product.dig('terms', 'OnDemand')
      return nil unless on_demand

      on_demand.each_value do |term|
        term.fetch('priceDimensions', {}).each_value do |dimension|
          usd = dimension.dig('pricePerUnit', 'USD')&.to_f
          return usd if usd&.positive?
        end
      end

      nil
    end
  end
end
