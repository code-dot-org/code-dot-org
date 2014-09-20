unless rack_env == :production

get '/v2/env_' do
  dont_cache
  content_type :json
  JSON.pretty_generate(env)
end

get '/v2/language_' do
  dont_cache
  content_type :json
  JSON.pretty_generate({
    'request.language'=>request.language,
    'request.locale'=>request.locale,
    'rack.locale'=>env['rack.locale'],
    'Varnish-Accept-Language'=>env['HTTP_X_VARNISH_ACCEPT_LANGUAGE'],
  })
end

get '/v2/user_' do
  only_for 'code.org'
  dont_cache
  forbidden! unless dashboard_user
  content_type :json
  JSON.pretty_generate(dashboard_user)
end

get '/v2/user_/permissions/:permit' do |permit|
  only_for 'code.org'
  dont_cache
  content_type :json
  JSON.pretty_generate({
    'user_id'=>dashboard_user_id,
    permit=>have_permission?(permit),
  })
end

end