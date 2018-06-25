require 'honeybadger'
#
# DEPRECATED: Every route implemented in this file is deprecated.
# Please do not add to this file.
# See /dashboardapi/sections* routes instead.
#

# Get the set of sections owned by the current user
# DEPRECATED: Use GET /dashboardapi/sections instead
get '/v2/sections' do
  Honeybadger.notify(
    error_class: "DeprecatedEndpointWarning",
    error_message: 'Deprecated endpoint GET /v2/sections called unexpectedly',
  )

  only_for 'code.org'
  dont_cache
  content_type :json
  sections = DashboardSection.fetch_user_sections(dashboard_user_id)
  forbidden! unless sections
  JSON.pretty_generate(sections)
end

# DEPRECATED: Use GET /dashboardapi/sections/<id> instead
get '/v2/sections/:id' do |id|
  Honeybadger.notify(
    error_class: "DeprecatedEndpointWarning",
    error_message: 'Deprecated endpoint GET /v2/sections/:id called unexpectedly',
  )

  only_for 'code.org'
  dont_cache
  forbidden! unless section = DashboardSection.fetch_if_teacher(id, dashboard_user_id)
  content_type :json
  JSON.pretty_generate(section.to_owner_hash)
end

# DEPRECATED: Use POST /dashboardapi/sections/<id>/students/bulk_add
post '/v2/sections/:id/students' do |id|
  Honeybadger.notify(
    error_class: "DeprecatedEndpointWarning",
    error_message: 'Deprecated endpoint POST /v2/sections/:id/students called unexpectedly',
  )

  only_for 'code.org'
  dont_cache
  unsupported_media_type! unless payload = request.json_body
  forbidden! unless section = DashboardSection.fetch_if_teacher(id, dashboard_user_id)
  added_students = section.add_students(payload)
  content_type :json
  JSON.pretty_generate(
    DashboardStudent.fetch_if_allowed_array(added_students, dashboard_user_id)
  )
end

# DEPRECATED: Use POST /dashboardapi/sections/<id>/students/<id>/remove
delete '/v2/sections/:id/students/:student_id' do |id, student_id|
  Honeybadger.notify(
    error_class: "DeprecatedEndpointWarning",
    error_message: 'Deprecated endpoint DELETE /v2/sections/:id/students/:student_id called unexpectedly',
  )

  only_for 'code.org'
  dont_cache
  forbidden! unless section = DashboardSection.fetch_if_teacher(id, dashboard_user_id)
  forbidden! unless section.remove_student(student_id)
  no_content!
end
post '/v2/sections/:id/delete' do |id|
  call(env.merge('REQUEST_METHOD' => 'DELETE', 'PATH_INFO' => "/v2/sections/#{id}/students/#{student_id}"))
end

# DEPRECATED: Will be removed, do not use.
get '/v2/sections/:id/teachers' do |id|
  Honeybadger.notify(
    error_class: "DeprecatedEndpointWarning",
    error_message: 'Deprecated endpoint GET /v2/sections/:id/teachers called unexpectedly',
  )

  only_for 'code.org'
  dont_cache
  forbidden! unless section = DashboardSection.fetch_if_allowed(id, dashboard_user_id)
  content_type :json
  JSON.pretty_generate(section.to_owner_hash[:teachers])
end
