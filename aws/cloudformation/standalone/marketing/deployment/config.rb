require "ostruct"

module Config
  AVAILABILITY_ZONES = [
    'us-east-1a',
    'us-east-1b',
    'us-east-1c',
    'us-east-1d',
    'us-east-1e',
    'us-east-1f'
  ].freeze

  PUBLIC_SUBNETS = [
    '10.0.0.0/20',
    '10.0.16.0/20',
    '10.0.32.0/20',
    '10.0.48.0/20',
    '10.0.64.0/20',
    '10.0.80.0/20'
  ].freeze

  PRIVATE_SUBNETS = [
    '10.0.128.0/20',
    '10.0.144.0/20',
    '10.0.160.0/20',
    '10.0.176.0/20',
    '10.0.192.0/20',
    '10.0.208.0/20'
  ].freeze
end
