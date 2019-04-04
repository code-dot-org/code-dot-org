require 'honeybadger/ruby'

get '/v2/user' do
  only_for 'code.org'
  dont_cache
  forbidden! unless dashboard_user_helper
  content_type :json
  JSON.pretty_generate(dashboard_user_helper.select(:id, :name, :admin, :owned_sections))
end

get '/v2/students' do
  only_for 'code.org'
  dont_cache
  content_type :json
  JSON.pretty_generate(DashboardStudent.fetch_user_students(dashboard_user_id))
end

get '/v2/students/:id' do |id|
  only_for 'code.org'
  dont_cache
  forbidden! unless student = DashboardStudent.fetch_if_allowed(id, dashboard_user_id)
  content_type :json
  JSON.pretty_generate(student.to_hash)
end

# DEPRECATED: Use PATCH /dashboardapi/sections/<id>/students/<student_id>
patch '/v2/students/:id' do |id|
  # Notify Honeybadger to determine if this endpoint is still used anywhere
  Honeybadger.notify(
    error_class: "DeprecatedEndpointWarning",
    error_message: 'Deprecated endpoint PATCH /v2/students/:id called unexpectedly',
  )

  only_for 'code.org'
  dont_cache
  unsupported_media_type! unless payload = request.json_body
  forbidden! unless student = DashboardStudent.update_if_allowed(payload.merge(id: id), dashboard_user_id)
  content_type :json
  JSON.pretty_generate(student.to_hash)
end

# DEPRECATED: Use PATCH /dashboardapi/sections/<id>/students/<student_id>
post '/v2/students/:id/update' do |id|
  call(env.merge('REQUEST_METHOD' => 'PATCH', 'PATH_INFO' => "/v2/students/#{id}"))
end
