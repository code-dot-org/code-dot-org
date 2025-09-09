class RobotsController < ApplicationController
  def index
    render plain: [
      'User-agent: *',
      'Allow: /'
    ].join("\n")

    # 2/28/25 - We are going to test using noindex for preventing indexing of all non
    # production environments and disallowed routes for a month. We plan to look at the
    # data and then decide if we want to bring this back at that point.
    # if rack_env?(:production)
    #   render plain: [
    #     'User-agent: *',
    #     'Allow: /',
    #     SharedConstants::DISALLOWED_ROUTES.map {|path| "Disallow: #{path}"}
    #   ].join("\n")
    # else
    #   render plain: [
    #     'User-agent: *',
    #     'Disallow: /'
    #   ].join("\n")
    # end
  end
end
