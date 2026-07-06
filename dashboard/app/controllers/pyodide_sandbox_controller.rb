class PyodideSandboxController < ApplicationController
  # Runs student Python (via pyodide) in a hidden iframe on a dedicated
  # codeprojects.org subdomain, isolated from studio.code.org's cookies/session.
  # Public, static content for now.
  def show
    set_content_security_policy
    render 'show', layout: false
  end

  private def set_content_security_policy
    code_studio_url = CDO.dashboard_site_host

    if rack_env?(:development)
      # dashboard_site_host is set to use port 3000 in development, but we want to also allow port 9000.
      port_9000_url = code_studio_url.split(':').first + ':9000'
      code_studio_url += " #{port_9000_url}"
    end

    # Unlike codeprojects_preview_controller, this sandbox never makes external network
    # requests or renders student HTML/CSS, so default-src/connect-src stay at 'self'.
    # TODO(CT-537): once patch_requests.py is wired up, requests.get() calls made from
    # inside this sandbox will hit the dashboard's xhr_proxy_controller on studio.code.org,
    # which will require adding code_studio_url to connect-src.
    default_src = "'self'"
    connect_src = "'self'"

    script_src = "'self' 'wasm-unsafe-eval'"
    if rack_env?(:development) || rack_env?(:test)
      # webpack's non-production builds (local dev, and CI via `devtool: 'eval'`) wrap
      # every module in an eval() call for source maps -- wasm-unsafe-eval doesn't cover
      # that, only actual eval() does. Minified/production builds use devtool: 'source-map'
      # instead, which doesn't need this.
      script_src += " 'unsafe-eval'"
    end

    # Explicit rather than relying on the worker-src -> script-src CSP3 fallback, since
    # this is exactly what lets us spawn the inner pyodide web worker.
    worker_src = "'self' blob:"
    style_src = "'self' 'unsafe-inline'"

    # Locked to studio.code.org only -- nothing else may embed this sandbox.
    frame_ancestors = code_studio_url.to_s

    policies = [
      "default-src #{default_src}",
      "connect-src #{connect_src}",
      "frame-ancestors #{frame_ancestors}",
      "script-src #{script_src}",
      "worker-src #{worker_src}",
      "style-src #{style_src}",
      "form-action 'none'",
    ]

    unless rack_env?(:development) || rack_env?(:test)
      # In non-development or test environments, we ensure all requests are over HTTPS.
      # Development does not support HTTPS. Some test environments (such as drone) do not support HTTPS.
      policies << 'upgrade-insecure-requests'
    end
    response.headers['Content-Security-Policy'] = policies.join('; ')
  end
end
