require "ostruct"

module Config
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
  # See matrix of domain names for each environment type and site type:
  # https://docs.google.com/spreadsheets/d/1abCYr1tFEs-Ag5lyq5m0r5zQi_ioGgr-Th3NAdocQPQ/edit?pli=1&gid=0#gid=0
  ENVIRONMENT_TYPES = {
    development: {
      baseDomain: 'marketing-sites.dev-code.org',
    },
    test: {
      baseDomain: 'marketing-sites.test-code.org',
      hostedZoneID: 'Z015947424Y2BVSKWMMYZ',
    },
    production: {
      interimBaseDomain: 'marketing-sites.code.org',
      interimHostedZoneID: '',
      baseDomain: 'code.org',
    }
  }
  MARKETING_SITE_TYPES = {
    # Corporate website (code.org in production)
    corporate: {
      subdomain: 'code' # code in code.marketing-sites.dev-code.org
    },
    hourofcode: {
      subdomain: 'hourofcode' # hourofcode in hourofcode.marketing-sites.test-code.org
    }
  }
end
