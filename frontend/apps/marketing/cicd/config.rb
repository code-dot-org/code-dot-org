require "ostruct"

module MarketingSites
  module Configuration
    # Standard CIDR blocks used across all regions
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

    REGIONS = {
      'us-east-1': {
        availability_zones: %w[us-east-1a us-east-1b us-east-1c us-east-1d us-east-1e us-east-1f],
        vpc: {
          public_subnets: [
            {
              availability_zone: 'us-east-1a',
              cidr_block: PUBLIC_SUBNET_CIDRS[0]
            },
            {
              availability_zone: 'us-east-1b',
              cidr_block: PUBLIC_SUBNET_CIDRS[1]
            },
            {
              availability_zone: 'us-east-1c',
              cidr_block: PUBLIC_SUBNET_CIDRS[2]
            },
            {
              availability_zone: 'us-east-1d',
              cidr_block: PUBLIC_SUBNET_CIDRS[3]
            },
            {
              availability_zone: 'us-east-1e',
              cidr_block: PUBLIC_SUBNET_CIDRS[4]
            },
            {
              availability_zone: 'us-east-1f',
              cidr_block: PUBLIC_SUBNET_CIDRS[5]
            }
          ],
          private_subnets: [
            {
              availability_zone: 'us-east-1a',
              cidr_block: PRIVATE_SUBNET_CIDRS[0]
            },
            {
              availability_zone: 'us-east-1b',
              cidr_block: PRIVATE_SUBNET_CIDRS[1]
            },
            {
              availability_zone: 'us-east-1c',
              cidr_block: PRIVATE_SUBNET_CIDRS[2]
            },
            {
              availability_zone: 'us-east-1d',
              cidr_block: PRIVATE_SUBNET_CIDRS[3]
            },
            {
              availability_zone: 'us-east-1e',
              cidr_block: PRIVATE_SUBNET_CIDRS[4]
            },
            {
              availability_zone: 'us-east-1f',
              cidr_block: PRIVATE_SUBNET_CIDRS[5]
            }
          ]
        }
      },
      'us-east-2': {
        availability_zones: %w[us-east-2a us-east-2b us-east-2c],
        vpc: {
          public_subnets: [
            {
              availability_zone: 'us-east-2a',
              cidr_block: PUBLIC_SUBNET_CIDRS[0]
            },
            {
              availability_zone: 'us-east-2b',
              cidr_block: PUBLIC_SUBNET_CIDRS[1]
            },
            {
              availability_zone: 'us-east-2c',
              cidr_block: PUBLIC_SUBNET_CIDRS[2]
            }
          ],
          private_subnets: [
            {
              availability_zone: 'us-east-2a',
              cidr_block: PRIVATE_SUBNET_CIDRS[0]
            },
            {
              availability_zone: 'us-east-2b',
              cidr_block: PRIVATE_SUBNET_CIDRS[1]
            },
            {
              availability_zone: 'us-east-2c',
              cidr_block: PRIVATE_SUBNET_CIDRS[2]
            }
          ]
        }
      },
      'us-west-1': {
        availability_zones: %w[us-west-1a us-west-1c],
        vpc: {
          public_subnets: [
            {
              availability_zone: 'us-west-1a',
              cidr_block: PUBLIC_SUBNET_CIDRS[0]
            },
            {
              availability_zone: 'us-west-1c',
              cidr_block: PUBLIC_SUBNET_CIDRS[1]
            }
          ],
          private_subnets: [
            {
              availability_zone: 'us-west-1a',
              cidr_block: PRIVATE_SUBNET_CIDRS[0]
            },
            {
              availability_zone: 'us-west-1c',
              cidr_block: PRIVATE_SUBNET_CIDRS[1]
            }
          ]
        }
      },
      'us-west-2': {
        availability_zones: %w[us-west-2a us-west-2b us-west-2c us-west-2d],
        vpc: {
          public_subnets: [
            {
              availability_zone: 'us-west-2a',
              cidr_block: PUBLIC_SUBNET_CIDRS[0]
            },
            {
              availability_zone: 'us-west-2b',
              cidr_block: PUBLIC_SUBNET_CIDRS[1]
            },
            {
              availability_zone: 'us-west-2c',
              cidr_block: PUBLIC_SUBNET_CIDRS[2]
            },
            {
              availability_zone: 'us-west-2d',
              cidr_block: PUBLIC_SUBNET_CIDRS[3]
            }
          ],
          private_subnets: [
            {
              availability_zone: 'us-west-2a',
              cidr_block: PRIVATE_SUBNET_CIDRS[0]
            },
            {
              availability_zone: 'us-west-2b',
              cidr_block: PRIVATE_SUBNET_CIDRS[1]
            },
            {
              availability_zone: 'us-west-2c',
              cidr_block: PRIVATE_SUBNET_CIDRS[2]
            },
            {
              availability_zone: 'us-west-2d',
              cidr_block: PRIVATE_SUBNET_CIDRS[3]
            }
          ]
        }
      }
    }
  end
end
