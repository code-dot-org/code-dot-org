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
