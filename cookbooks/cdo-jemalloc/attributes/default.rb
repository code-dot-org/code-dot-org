default['cdo-jemalloc']['version'] = '5.3.1'
default['cdo-jemalloc']['checksum'] = '3826bc80232f22ed5c4662f3034f799ca316e819103bdc7bb99018a421706f92'
default['cdo-jemalloc']['lib'] = '/usr/local/lib/libjemalloc.so.2'

# See:
# https://github.com/jemalloc/jemalloc/blob/dev/TUNING.md
# http://jemalloc.net/jemalloc.3.html
# To convert this attributes hash to a malloc_conf string, run:
# node['cdo-jemalloc']['malloc_conf'].map {|x| x.join(':')}.join(',')
# Any changes to MALLOC_CONF must also be applied to our Docker continuous integration builds:
#   `docker/ci/scripts/prepare_ci_env.sh`
default['cdo-jemalloc']['malloc_conf'] = {
  # Maximum number of arenas to use for automatic multiplexing of threads and arenas.
  # The default is four times the number of CPUs, or one if there is a single CPU.
  narenas: 2,

  # Enabling jemalloc background threads generally improves the tail latency for application threads,
  # since unused memory purging is shifted to the dedicated background threads.
  # In addition, unintended purging delay caused by application inactivity is avoided with background threads.
  #
  # Suggested: background_thread:true when jemalloc managed threads can be allowed.
  background_thread: true,

  # Transparent hugepage (THP) mode.
  # Settings "always", "never" and "default" are available if THP is supported by the operating system.
  # The "always" setting enables transparent hugepage for all user memory mappings with MADV_HUGEPAGE;
  # "never" ensures no transparent hugepage with MADV_NOHUGEPAGE; the default setting "default" makes no changes.
  thp: 'never',

  # Decay time determines how fast jemalloc returns unused pages back to the operating system,
  # and therefore provides a fairly straightforward trade-off between CPU and memory usage.
  # Shorter decay time purges unused pages faster to reduces memory usage
  # (usually at the cost of more CPU cycles spent on purging), and vice versa.
  #
  # Suggested: tune the values based on the desired trade-offs.
  dirty_decay_ms: 500, # Default 10_000
  muzzy_decay_ms: 0, # Default 10_000

  # Abort on invalid MALLOC_CONF options rather than silently ignoring them.
  abort_conf: true
}
