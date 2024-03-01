require "cdo/statsig"
# Statsig is initialized here for the development environment. In managed
# environments, it is initialized in lib/cdo/app_server_hooks
if CDO.rack_env?(:development)
  Cdo::StatsigInitializer.init
end
