default['cdo-apps'] = {
  'dashboard' => {
    'port' => 8080,
    'env' => {
      RUBY_GC_HEAP_FREE_SLOTS: 600_000, # Default is 4096
      RUBY_GC_MALLOC_LIMIT_MAX: 134_217_728, # 128MB, default is 32MB
      RUBY_GC_OLDMALLOC_LIMIT_MAX: 300_000_000, # 300MB, default is 128MB
      RUBY_GC_HEAP_OLDOBJECT_LIMIT_FACTOR: 3 # Default is 2.0
    }
  },

  'pegasus' => {
    'port' => 8081,
    'env' => {}
  },

  'i18n' => {
    'languages' => {
      'en' => 'English',
    },
  },
  'nginx_enabled' => true,
  'app_server' => 'puma',
  'jemalloc' => true
}
#default['omnibus_updater']['version'] = '12.7.2'
default['omnibus_updater']['version'] = '15.2.20'
