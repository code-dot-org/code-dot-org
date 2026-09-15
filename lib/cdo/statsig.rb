require 'statsig'

module Cdo
  module StatsigInitializer
    # Statsig's ruleset and id-list pollers resolve api.statsigcdn.com, a multi-address name, every 10 and 60 seconds.
    # A parent puma process that forks must not run the Statsig's ruleset and id-list pollers due to a glibc issue.
    # See `bin/ops/dns-deadlock-after-fork`
    # Each puma child/worker starts its own ruleset and id-list pollers in `before_worker_boot`.
    def self.init
      return if CDO.preforking_parent?

      # Enable local_mode for all environments except Production and our managed Test
      # web application server. This is done to keep parity between those two
      # environments. Anything else that runs on the Test server, as well as
      # code that executes in the continuous integration builds, will run in local_mode.
      # This limits the number of metrics we emit, thereby lowering our credit usage.
      local_mode = !(CDO.rack_env?(:production) || CDO.managed_test_server?)
      options = StatsigOptions.new({'tier' => CDO.rack_env}, network_timeout: 10, logging_interval_seconds: 30, local_mode: local_mode)
      # Initialize Statsig
      Statsig.initialize(CDO.statsig_server_secret_key, options)
    end
  end
end
