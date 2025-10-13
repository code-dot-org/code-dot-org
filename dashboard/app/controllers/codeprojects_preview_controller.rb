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

      # Explicitly allow WebSocket connections to preview.localhost.codeprojects.org:9000, which is used by the webpack dev server
      # both on ports 9000 and 3000.
      allowed_connect_src += " ws://preview.localhost.codeprojects.org:9000/ws"
    end

    # Security Control: Set base resource loading policy ("default" is a fallback for unspecified resource types)
    # Goal: Prevent loading of unauthorized external resources for any resource type not explicitly allowed below
    # Remaining Risk: Blob URLs could contain malicious content (mitigated by iframe sandbox)
    # Note: More specific directives (script-src, style-src, etc.) override this for their resource types
    default_src = "'self' blob:"

    # Security Control: Restrict network connections (XHR, fetch, WebSocket, etc.)
    # Goal: Allow student projects to connect to legitimate APIs while blocking malicious sites
    # Remaining Risk: Approved domains could be compromised (mitigated by domain allowlist)
    # Note: This overrides default-src for network requests
    connect_src = "'self' #{allowed_connect_src}"

    # Security Control: Restrict JavaScript execution sources (overrides default-src for scripts)
    # Goal: Allow student code execution while preventing external script injection
    script_src_base = "'self' blob:"

    # Security Control: Allow eval() for dynamic code execution in student projects and to load our dependencies.
    # Goal: Enable loading dependencies that use eval() so we can preview student projects.
    # Remaining Risk: Malicious student code could use eval() for attacks (mitigated by iframe sandbox)
    script_src_eval = " 'unsafe-eval'"

    # Security Control: Allow inline scripts for student HTML projects
    # Goal: Enable students to write inline JavaScript in their HTML files
    # Remaining Risk: Malicious inline scripts run in global context without isolation (mitigated by iframe sandbox)
    script_src_inline = " 'unsafe-inline'"

    # Security Control: Restrict CSS loading sources (overrides default-src for stylesheets)
    # Goal: Allow student styling while preventing external CSS injection
    style_src_base = "'self' https: blob:"

    # Security Control: Allow inline styles for student HTML projects
    # Goal: Enable students to write inline CSS in their HTML files
    # Remaining Risk: Malicious inline styles could be used for UI manipulation (mitigated by iframe sandbox)
    style_src_inline = " 'unsafe-inline'"

    # Security Control: Restrict image loading sources (overrides default-src for images)
    # Goal: Allow student images while preventing external image injection
    # Remaining Risk: Data URLs could contain malicious content (mitigated by iframe sandbox)
    img_src = "'self' https: data: blob: #{code_studio_url}"

    # Security Control: Restrict which sites can embed this page in iframes
    # Goal: Prevent clickjacking attacks by controlling frame embedding
    frame_ancestors = "#{code_studio_url} 'self'"

    script_src = script_src_base + script_src_eval + script_src_inline
    style_src = style_src_base + style_src_inline

    policies = [
      "default-src #{default_src}",
      "connect-src #{connect_src}",
      "frame-ancestors #{frame_ancestors}",
      "script-src #{script_src}",
      "style-src #{style_src}",
      "img-src #{img_src}",
    ]

    unless rack_env?(:development) || rack_env?(:test)
      # In non-development or test environments, we ensure all requests are over HTTPS.
      # This allows students to make requests to HTTP APIs from their projects.
      # Development does not support HTTPS. Some test environments (such as drone) do not support HTTPS.
      policies << "upgrade-insecure-requests"
    end
    response.headers['Content-Security-Policy'] = policies.join('; ')
    render 'show', layout: false
  end
end
