class CodeprojectsPreviewController < ApplicationController
  # Public preview page, static content for now.
  def show
    code_studio_url = CDO.dashboard_site_host

    if rack_env?(:development)
      # dashboard_site_host is set to use port 3000 in development, but we want to also allow port 9000.
      port_9000_url = code_studio_url.split(":").first + ":9000"
      code_studio_url += " #{port_9000_url}"
    end

    # TODO: limit requests here too with connect-src.
    response.headers['Content-Security-Policy'] = "frame-ancestors #{code_studio_url}"
    render 'show', layout: false
  end
end
