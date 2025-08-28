class CodeprojectsPreviewController < ApplicationController
  include AllowedHostnameHelper
  # Public preview page, static content for now.
  def show
    code_studio_url = CDO.dashboard_site_host
    # Chrome will block connecting to an http url from an https page, even with upgrade-insecure-requests.
    # Therefore we explicitly set the prefix to 'http', which will also allow https.
    prefix = 'http://'
    # We allow connections to the domain and all subdomains of each allowed hostname.
    allowed_connect_src = ALLOWED_HOSTNAME_SUFFIXES.map {|hostname| "#{prefix}#{hostname} #{prefix}*.#{hostname}"}.join(" ")

    if rack_env?(:development)
      # dashboard_site_host is set to use port 3000 in development, but we want to also allow port 9000.
      port_9000_url = code_studio_url.split(":").first + ":9000"
      code_studio_url += " #{port_9000_url}"
    end

    policies = [
      "default-src 'self' blob:",
      "connect-src 'self' #{allowed_connect_src}",
      "frame-ancestors #{code_studio_url} 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob:",
      "style-src 'self' https: 'unsafe-inline' blob:",
      "img-src 'self' https: data: blob: https://*.code.org",
    ]

    unless rack_env?(:development)
      # In non-development environments, we ensure all requests are over HTTPS.
      policies << "upgrade-insecure-requests"
    end
    response.headers['Content-Security-Policy'] = policies.join('; ')
    render 'show', layout: false
  end
end
