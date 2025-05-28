require "ostruct"

module MarketingSites
  module Configuration
    REGIONS = {
      'us-east-2': {
        availability_zones: %w[us-east-2a us-east-2b us-east-2c],
        vpc: {
          public_subnets: [
            {
              availability_zone: 'us-east-2a',
              cidr_block: '10.0.0.0/21'
            },
            {
              availability_zone: 'us-east-2b',
              cidr_block: '10.0.8.0/21'
            },
            {
              availability_zone: 'us-east-2c',
              cidr_block: '10.0.16.0/21'
            },

          ],
          private_subnets: [
            {
              availability_zone: 'us-east-2a',
              cidr_block: '10.0.128.0/21'
            },
            {
              availability_zone: 'us-east-2b',
              cidr_block: '10.0.136.0/21'
            },
            {
              availability_zone: 'us-east-2c',
              cidr_block: '10.0.144.0/21'
            }
          ]
        }
      },
      'us-east-1': {
        availability_zones: %w[us-east-1a us-east-1b us-east-1c],
        vpc: {
          public_subnets: [
            {
              availability_zone: 'us-east-1a',
              cidr_block: '10.0.0.0/21'
            },
            {
              availability_zone: 'us-east-1b',
              cidr_block: '10.0.8.0/21'
            },
            {
              availability_zone: 'us-east-1c',
              cidr_block: '10.0.16.0/21'
            },

          ],
          private_subnets: [
            {
              availability_zone: 'us-east-1a',
              cidr_block: '10.0.128.0/21'
            },
            {
              availability_zone: 'us-east-1b',
              cidr_block: '10.0.136.0/21'
            },
            {
              availability_zone: 'us-east-1c',
              cidr_block: '10.0.144.0/21'
            }
          ]
        }
      }
    }
  end
end
