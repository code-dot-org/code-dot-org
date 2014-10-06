get '/' do
  pass unless request.user_agent =~ /^facebookexternalhit\/1\.1/
  dont_cache
  env['PATH_INFO'] = '/us'
  pass
end

get '*' do |uri|
  only_for 'hourofcode.com'
  dont_cache unless rack_env == :production
  env['PATH_INFO'] = hoc_canonicalized_i18n_path(uri) unless resolve_static('public', uri)
  pass
end
