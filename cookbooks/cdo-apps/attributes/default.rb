default['cdo-apps'] = {
  'dashboard' => {
    'port' => 8080,
  },

  'pegasus' => {
    'port' => 8081,
  },

  'i18n' => {
    'languages' => {
      'en' => 'English',
    },
  },
  'nginx_enabled' => true
}
default['omnibus_updater']['version'] = '12.7.2'
