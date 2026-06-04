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

JsRoutes.generate!(apps_dir('generated-scripts/studioRoutes.js'), url_links: true)
