get '/' do
  pass unless request.user_agent =~ /^facebookexternalhit\/1\.1/
  dont_cache
  env['PATH_INFO'] = '/us'
  pass
end

get '*' do |uri|
  only_for 'hourofcode.com'
  dont_cache unless rack_env == :production
  env['PATH_INFO'] = hoc_canonicalized_i18n_path(uri, request.query_string) unless resolve_static('public', uri)
  # hoc_canonicalized_i18n_path has a side effect of setting some important
  # instance variables like country, language, etc., so we need to re-assign
  # them to actionview here.
  #
  # These values should ideally be directly inferred from request rather than
  # managed as volatile instance variables.
  update_actionview_assigns
  pass
end
