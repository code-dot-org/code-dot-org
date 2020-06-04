module Cdo::CloudFormation
  # Helper functions related to VPC subnets.
  module VPC
    AVAILABILITY_ZONES = ('b'..'e').map {|i| "us-east-1#{i}"}
    SSH_IP = '0.0.0.0/0'.freeze

    def azs(zones=AVAILABILITY_ZONES)
      zones.map {|zone| zone[-1].upcase}
    end

    def subnets(azs=self.azs)
      azs.map {|az| {'Fn::ImportValue': "VPC-Subnet#{az}"}}
    end

    def public_subnets(azs=self.azs)
      azs.map {|az| {'Fn::ImportValue': "VPC-PublicSubnet#{az}"}}
    end
  end
end
