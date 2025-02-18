require 'statsig'

module Cdo
  module StatsigInitializer
    def self.init
      # Determine if this is the managed Test web application server
      managed_test_environment = CDO.running_web_application? && CDO.test_system?
      # Enable local_mode for all environments except Production and our managed Test
      # web application server. This is done to keep parity between those two
      # environments. Anything else that runs on the Test server, as well as
      # code that executes in the continous integration builds, will run in local_mode.
      # This limits the number of metrics we emit, thereby lowering our credit usage.
      local_mode = CDO.rack_env?(:production) || managed_test_environment ? false : true
      options = StatsigOptions.new({'tier' => CDO.rack_env}, network_timeout: 10, logging_interval_seconds: 30, local_mode: local_mode)
      # Initialize Statsig
      Statsig.initialize(CDO.statsig_server_secret_key, options)
    end
  end
end
