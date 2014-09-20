get '*' do |uri|
  only_for 'hourofcode.com'
  dont_cache unless rack_env == :production
  env['PATH_INFO'] = hoc_canonicalized_i18n_path(uri) unless resolve_static('public', uri)
  pass
end
