class RobotsController < ApplicationController
  def index
    if rack_env?(:production)
      render plain: [
        'User-agent: *',
        'Allow: /',
        SharedConstants::DISALLOWED_ROUTES.map {|path| "Disallow: #{path}"}
      ].join("\n")
    else
      render plain: [
        'User-agent: *',
        'Disallow: /'
      ].join("\n")
    end
  end
end
