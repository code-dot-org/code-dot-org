require "ostruct"

module Config
  REGIONS = {
    'us-east-2': {
      availability_zones: %w[us-east-2a us-east-2b],
      vpc: {
        public_subnets: [
          {
            availability_zone: 'us-east-2a',
            cidr_block: '10.0.0.0/18'
          },
          {
            availability_zone: 'us-east-2b',
            cidr_block: '10.0.64.0/18'
          }
        ],
        private_subnets: [
          {
            availability_zone: 'us-east-2a',
            cidr_block: '10.0.128.0/18'
          },
          {
            availability_zone: 'us-east-2b',
            cidr_block: '10.0.192.0/18'
          }
        ]
      }
    }
  }
  STAGES = {
    test: {
      baseDomain: 'marketing-sites.dev-code.org', # temporarily dev-code.org until test-code.org is set up
    },
    production: {
      baseDomain: 'marketing-sites.code.org',
    }
  }
  MARKETING_SITES = {
    CDO: {
      shortCode: 'CDO',
      subdomain: 'code' # code in code.marketingsites.code.org
    }
  }
end
