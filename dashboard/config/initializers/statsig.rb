require 'statsig'

local_mode = CDO.rack_env?(:production) || CDO.rack_env?(:staging) ? false : true
options = StatsigOptions.new({'tier' => CDO.rack_env}, network_timeout: 5, local_mode: local_mode)
Statsig.initialize(CDO.statsig_server_secret_key, options)
