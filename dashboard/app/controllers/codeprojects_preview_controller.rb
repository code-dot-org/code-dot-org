class CodeprojectsPreviewController < ApplicationController
  include AllowedHostnameHelper
  # Public preview page, static content for now.
  def show
    code_studio_url = CDO.dashboard_site_host
    allowed_connect_src = ALLOWED_HOSTNAME_SUFFIXES.join(" ")

    if rack_env?(:development)
      # dashboard_site_host is set to use port 3000 in development, but we want to also allow port 9000.
      port_9000_url = code_studio_url.split(":").first + ":9000"
      code_studio_url += " #{port_9000_url}"
      # On localhost, the development websocket server runs on the preview page, so we need to allow self.
      allowed_connect_src += 'self'
    end

    response.headers['Content-Security-Policy'] = "frame-ancestors #{code_studio_url}; connect-src 'self' #{allowed_connect_src}"
    render 'show', layout: false
  end
end
