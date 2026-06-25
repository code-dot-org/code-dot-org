require "cdo/statsig"
# Statsig is initialized here for every process except the puma cluster
# master. The master only forks and supervises workers, and the SDK's
# background threads must not run there: a worker forked while one of them
# is inside getaddrinfo inherits glibc's __check_pf lock held, deadlocking
# all later DNS lookups in that worker (see dashboard/config/puma.rb).
# Cluster workers initialize Statsig in Cdo::AppServerHooks.before_worker_boot.
Cdo::StatsigInitializer.init unless ENV['PUMA_CLUSTER_PRELOAD']
