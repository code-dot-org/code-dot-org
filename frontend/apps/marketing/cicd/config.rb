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
#
# # Get site configuration for specific site+environment combination
# MarketingSites::Configuration.site_config(:corporate, :production)
#
# # Get all available site types
# MarketingSites::Configuration.site_types
#
# # Get all available environment types
# MarketingSites::Configuration.environment_types

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

    # Unified site configuration using nested hash with deep merge approach
    SITE_CONFIG = {
      # Global defaults that apply to all site+environment combinations
      defaults: {
        contentful_env_id: 'master'
      }.freeze,

      # Site-specific configuration (applies to all environments for that site type)
      site_defaults: {
        corporate: {
          # Environment Variables to pass to the Next.js web application server.
          environment_variables: {
            CONTENTFUL_SPACE_ID: '90t6bu6vlf76',
            CONTENTFUL_ENV_ID: 'master'
          },
        }.freeze,
        csforall: {
          # Environment Variables to pass to the Next.js web application server.
          environment_variables: {
            CONTENTFUL_SPACE_ID: '27jkibac934d',
            CONTENTFUL_ENV_ID: 'master'
          },
        }.freeze
      }.freeze,

      # Environment-specific configuration (applies to all sites in that environment)
      environment_defaults: {
        development: {
          base_domain_name: 'marketing-sites.dev-code.org',
        }.freeze,
        test: {
          base_domain_name: 'marketing-sites.test-code.org',
        }.freeze,
        production: {}.freeze
      }.freeze,

      # Specific overrides for site+environment combinations
      # Use array keys [site_type, environment_type] for precise targeting
      overrides: {
        [:corporate, :production] => {
          base_domain_name: 'code.org'
        }.freeze,
        [:csforall, :production] => {
          base_domain_name: 'csforall.org'
        }.freeze
      }.freeze
    }.freeze

    class << self
      # AWS Regions functionality (unchanged)
      def regions
        @regions ||= build_dynamic_regions
      end

      def refresh_regions!
        @availability_zones_cache = nil
        @regions = nil
        regions
      end

      # Site configuration functionality
      def site_config(site_type, environment_type)
        site_type = site_type.to_sym
        environment_type = environment_type.to_sym

        # Start with global defaults
        config = SITE_CONFIG[:defaults].dup

        # Merge site-specific defaults
        site_defaults = SITE_CONFIG[:site_defaults][site_type]
        config.merge!(site_defaults) if site_defaults

        # Merge environment-specific defaults
        environment_defaults = SITE_CONFIG[:environment_defaults][environment_type]
        config.merge!(environment_defaults) if environment_defaults

        # Apply specific overrides for this combination
        override_key = [site_type, environment_type]
        overrides = SITE_CONFIG[:overrides][override_key]
        config.merge!(overrides) if overrides

        # Return as an OpenStruct for convenient access
        OpenStruct.new(config)
      end

      # Get all available site types
      def site_types
        SITE_CONFIG[:site_defaults].keys
      end

      # Get all available environment types
      def environment_types
        SITE_CONFIG[:environment_defaults].keys
      end

      # Get site configuration as hash (for backwards compatibility or serialization)
      def site_config_hash(site_type, environment_type)
        site_config(site_type, environment_type).to_h
      end

      # Validate that a site+environment combination is supported
      def valid_combination?(site_type, environment_type)
        site_types.include?(site_type.to_sym) &&
          environment_types.include?(environment_type.to_sym)
      end

      # Get base configuration for a site type (without environment specifics)
      def site_base_config(site_type)
        site_type = site_type.to_sym
        config = SITE_CONFIG[:defaults].dup
        site_defaults = SITE_CONFIG[:site_defaults][site_type]
        config.merge!(site_defaults) if site_defaults
        OpenStruct.new(config)
      end

      # Get base configuration for an environment type (without site specifics)
      def environment_base_config(environment_type)
        environment_type = environment_type.to_sym
        config = SITE_CONFIG[:defaults].dup
        environment_defaults = SITE_CONFIG[:environment_defaults][environment_type]
        config.merge!(environment_defaults) if environment_defaults
        OpenStruct.new(config)
      end

      # Legacy compatibility methods (to maintain backwards compatibility)
      def contentful_space_id(site_type)
        site_base_config(site_type).contentful_space_id
      end

      def base_domain_name(environment_type)
        environment_base_config(environment_type).base_domain_name
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
