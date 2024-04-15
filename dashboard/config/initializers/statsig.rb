require "cdo/statsig"
# Statsig is initialized here for all environments. In managed
# environments, it is also initialized in lib/cdo/app_server_hooks. This
# guarantees Statsig has been initialized everywhere, and is available in all
# worker threads.
Cdo::StatsigInitializer.init
