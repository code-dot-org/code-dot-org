#!/usr/bin/env ruby
#
# This script uses the js-routes gem to generate a static JavaScript module
# with helper functions for Rails (Dashboard/Studio) named routes.
#
# The generated helpers let front-end code build Studio paths and URLs from
# the Rails route definitions instead of hardcoding route strings manually.
#
require 'js-routes'

require_relative '../../dashboard/config/environment'

STUDIO_JS_ROUTES_INSTANCE = Class.new(JsRoutes::Instance) do
  # @see https://github.com/railsware/js-routes/blob/v2.3.7/lib/js_routes/instance.rb#L225-L228
  protected def route_helpers_if_match(route, ...)
    # Excludes routes that belong to non-Studio Dashboard hosts, such as `codeprojects.org`.
    route_host = route.constraints[:host] || route.defaults[:host]
    return [] if route_host && !route_host.match?(CDO.dashboard_hostname)

    super
  end
end

STUDIO_JS_ROUTES_INSTANCE.new(
  file: apps_dir('generated-scripts/studioRoutes.js'),
  exclude: [/^dev_/, /^test_/],
  url_links: true,
).generate!
