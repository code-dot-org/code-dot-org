class RobotsController < ApplicationController
  DISALLOWED_ROUTES = [
    "/admin/",
    "/api/",
    "/blockly/",
    "/dashboardapi/",
    "/join/",
    "/milestone/",
    "/projects/",
    "/sections/"
  ].to_set.freeze

  def index
    if rack_env?(:production)
      render plain: [
        'User-agent: *',
        'Allow: /',
        DISALLOWED_ROUTES.map {|path| "Disallow: #{path}"}
      ].join("\n")
    else
      render plain: [
        'User-agent: *',
        'Disallow: /'
      ].join("\n")
    end
  end
end
