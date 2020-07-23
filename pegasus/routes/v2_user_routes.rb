get '/v2/user' do
  only_for 'code.org'
  dont_cache
  forbidden! unless dashboard_user_helper
  content_type :json
  JSON.pretty_generate(dashboard_user_helper.select(:id, :name, :admin, :owned_sections))
end
