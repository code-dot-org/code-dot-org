require "ostruct"
require "aws-sdk-ec2"

# Dynamically retrieve the Availability Zones in the current AWS Account to generate configuration of networking
# Resources (public/private Subnets) used by Marketing Sites CloudFormation templates.
#
# Usage examples:
#
# # Get all regions configuration
# MarketingSites::Configuration.regions
#
# # Get specific region
# MarketingSites::Configuration.regions[:'us-west-1']
#
# # Refresh configuration (useful if AZs change or for testing)
# MarketingSites::Configuration.refresh_regions!
#
# # Check what AZs are available in a specific region
# MarketingSites::Configuration.regions[:'us-west-1'][:availability_zones]

module MarketingSites
  module Configuration
    # Standard CIDR blocks used across all regions
    # We define 6 blocks to have flexibility, but limit usage to 3 AZs per region
    PUBLIC_SUBNET_CIDRS = %w[
      10.0.0.0/21
      10.0.8.0/21
      10.0.16.0/21
      10.0.24.0/21
      10.0.32.0/21
      10.0.40.0/21
    ].freeze

    PRIVATE_SUBNET_CIDRS = %w[
      10.0.128.0/21
      10.0.136.0/21
      10.0.144.0/21
      10.0.152.0/21
      10.0.160.0/21
      10.0.168.0/21
    ].freeze

    # All non-gov US regions
    US_REGIONS = %w[
      us-east-1
      us-east-2
      us-west-1
      us-west-2
    ].freeze

    class << self
      def regions
        @regions ||= build_dynamic_regions
      end

      def refresh_regions!
        @availability_zones_cache = nil
        @regions = nil
        regions
      end

      private def availability_zones_cache
        @availability_zones_cache ||= {}
      end

      private def build_dynamic_regions
        regions_config = {}

        US_REGIONS.each do |region|
          available_azs = get_availability_zones(region)
          next if available_azs.empty?

          # Use up to 3 AZs (or the maximum that the region has if less than 3)
          selected_azs = available_azs.first([available_azs.length, 3].min)

          regions_config[region.to_sym] = {
            availability_zones: available_azs,
            selected_availability_zones: selected_azs,
            vpc: build_vpc_config(selected_azs)
          }
        rescue => exception
          warn "Warning: Could not retrieve availability zones for #{region}: #{exception.message}"
          # Skip this region if we can't get AZ information
        end

        regions_config
      end

      private def get_availability_zones(region)
        return availability_zones_cache[region] if availability_zones_cache[region]

        ec2 = Aws::EC2::Client.new(region: region)
        response = ec2.describe_availability_zones(
          filters: [
            {
              name: 'state',
              values: ['available']
            }
          ]
        )

        azs = response.availability_zones.
                      map(&:zone_name).
                      sort

        availability_zones_cache[region] = azs
        azs
      rescue => exception
        warn "Error retrieving AZs for #{region}: #{exception.message}"
        []
      end

      private def build_vpc_config(availability_zones)
        public_subnets = []
        private_subnets = []

        availability_zones.each_with_index do |az, index|
          # Ensure we don't exceed our CIDR block arrays
          break if index >= PUBLIC_SUBNET_CIDRS.length

          public_subnets << {
            availability_zone: az,
            cidr_block: PUBLIC_SUBNET_CIDRS[index]
          }

          private_subnets << {
            availability_zone: az,
            cidr_block: PRIVATE_SUBNET_CIDRS[index]
          }
        end

        {
          public_subnets: public_subnets,
          private_subnets: private_subnets
        }
      end
    end
  end
end
