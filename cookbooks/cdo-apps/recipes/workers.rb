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

total_memory_kb = node['memory']['total'].to_i
dashboard_workers = node['cpu']['total'].to_i
pegasus_workers = node['cpu']['total'].to_i * PEGASUS_DASHBOARD_RATIO

total_usage_kb = (dashboard_workers * DASHBOARD_USAGE) + (pegasus_workers * PEGASUS_USAGE)
max_memory_usage = total_memory_kb * MEMORY_RATIO

if total_usage_kb < max_memory_usage
  # Enough to run on all cores
else
  # Not enough to run on all cores; scale down worker count proportionally to fit in available space
  scale_cores = max_memory_usage.to_f / total_usage_kb
  dashboard_workers *= scale_cores
  pegasus_workers *= scale_cores
end

node.default['cdo-secrets']['dashboard_workers'] = [1, dashboard_workers].max.to_i
node.default['cdo-secrets']['pegasus_workers'] = [1, pegasus_workers].max.to_i

# Disable image optimization if we don't have enough CPUs to
# precompile assets in a reasonable amount of time.
node.default['cdo-secrets']['image_optim'] = false if dashboard_workers < 8
