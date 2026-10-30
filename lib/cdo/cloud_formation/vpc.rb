module Cdo::CloudFormation
  # Helper functions related to VPC subnets.
  module VPC
    AVAILABILITY_ZONES = ('b'..'e').map {|i| "us-east-1#{i}"}
    SSH_IP = '0.0.0.0/0'.freeze

    def availability_zone_suffixes(zones = AVAILABILITY_ZONES)
      zones.map {|zone| zone[-1].upcase}
    end

    def subnets(zone_suffixes = availability_zone_suffixes)
      zone_suffixes.map {|az| {'Fn::ImportValue': "VPC-Subnet#{az}"}}
    end

    def public_subnets(zone_suffixes = availability_zone_suffixes)
      zone_suffixes.map {|az| {'Fn::ImportValue': "VPC-PublicSubnet#{az}"}}
    end
  end
end
