require 'statsig'

# Statsig is initialized here for the development environment. In managed
# environments, it is initialized in config/puma.rb
if CDO.rack_env?(:development)
  options = StatsigOptions.new({'tier' => :development}, network_timeout: 5, local_mode: true)
  Statsig.initialize(CDO.statsig_server_secret_key, options)
end
