require "cdo/statsig"
# Initialize Statsig in environments that use puma in Single mode (development environments). This is a no-op in
# environments that use puma in cluster mode and that fork workers. Those initialize Statsig in the worker:
# `Cdo::AppServerHooks.before_worker_boot`
Cdo::StatsigInitializer.init
