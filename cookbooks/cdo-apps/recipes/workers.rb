# Set default number of worker processes based on reported CPU and memory.
# These values can be overridden using override attributes in the Chef configuration,
# but the defaults should usually be used (or tweaked/fixed).

# Approximate max Dashboard memory usage per process
DASHBOARD_USAGE = 800 * 1024

# Approximate max Pegasus memory usage per process
PEGASUS_USAGE = 400 * 1024

# Ratio of Pegasus to Dashboard worker processes
PEGASUS_DASHBOARD_RATIO = 0.5.to_f
MEMORY_RATIO = 0.8.to_f

# Parse Varnish storage backend allocation from existing Chef attribute.
# Syntax: https://www.varnish-cache.org/docs/trunk/users-guide/storage-backends.html#storage-backends
varnish_storage_gb = node['cdo-varnish']['storage'].match(/malloc,(\d+[,.]?\d*)([KkMmGgTt])?/)
varnish_suffix_map = {b: 1.0/1024, k: 1, m: 1024, g: 1024*1024, t: 1024*1024*1024}
varnish_overhead = varnish_storage_gb ?
  varnish_storage_gb[1].to_f *
    varnish_suffix_map[(varnish_storage_gb[2] || 'b').downcase.to_sym] :
  0.5.to_f

# "approximately 1k of memory per object, used for various internal structures, is included in the actual storage as well."
# 2x reflects real usage observation (8GB observed memory usage when 'malloc,4g' is set).
varnish_overhead *= 2

total_memory_kb = node['memory']['total'].to_i
dashboard_workers = node['cpu']['total'].to_i
pegasus_workers = node['cpu']['total'].to_i * PEGASUS_DASHBOARD_RATIO

total_usage_kb = dashboard_workers * DASHBOARD_USAGE + pegasus_workers * PEGASUS_USAGE + varnish_overhead
max_memory_usage = total_memory_kb * MEMORY_RATIO
max_unicorn_usage = max_memory_usage - varnish_overhead

if total_usage_kb < max_unicorn_usage
  # Enough to run on all cores
else
  # Not enough to run on all cores; scale down worker count proportionally to fit in available space
  scale_cores = max_unicorn_usage.to_f / total_usage_kb
  dashboard_workers *= scale_cores
  pegasus_workers *= scale_cores
end

node.default['cdo-secrets']['dashboard_workers'] = [1, dashboard_workers].max.to_i
node.default['cdo-secrets']['pegasus_workers'] = [1, pegasus_workers].max.to_i
