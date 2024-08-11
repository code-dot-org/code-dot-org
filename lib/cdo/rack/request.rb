require 'rack/request'
require 'rack/session/abstract/id'
require 'ipaddr'
require 'json'
require 'country_codes'

module Cdo
  module RequestExtension
    TRUSTED_PROXIES = JSON.parse(File.read(deploy_dir('lib/cdo/trusted_proxies.json')))['ranges'].map do |proxy|
      IPAddr.new(proxy)
    end

    def trusted_proxy?(ip)
      super(ip) || TRUSTED_PROXIES.any? do |proxy|
        proxy.include?(ip)
      rescue
        false
      end
    end

    def json_body
      return nil unless content_type.split(';').first == 'application/json'
      return nil unless content_charset.casecmp?('utf-8')
      JSON.parse(body.read, symbolize_names: true)
    end

    def language
      locale.split('-').first
    end

    def locale
      env['cdo.locale'] || 'en-US'
    end

    def referer_site_with_port
      url = URI.parse(referer.to_s)
      host = http_host_and_port(url.host, url.port)
      return host if host.include?('csedweek.org')
      return host if host.include?('code.org')
      return 'code.org'
    rescue URI::InvalidURIError
      return 'code.org'
    end

    def site
      @site ||= site_from_host
    end

    # Patch: don't use X_FORWARDED_HOST header when determining host from request headers.
    # Specifically, here we patch the upstream authority method to ignore the "forwarded" authority option
    # See https://github.com/rack/rack/blob/1741c580d71cfca8e541e96cc372305c8892ee74/lib/rack/request.rb#L222-L229
    def authority
      host_authority || server_authority
    end

    def site_from_host
      host_parts = host

      # staging-studio.code.org -> ['staging', 'studio', 'code', 'org']
      host_parts.sub!('-', '.') unless rack_env?(:production)
      parts = host_parts.split('.')

      # If its a dev url like: hourofcode.com.localhost or studio.code.org.localhost
      # just remove the .localhost from the end and continue processing it.
      parts.pop if parts.last.split(':').first == 'localhost'

      # Handle a dashboard url like: studio.code.org (or studio.partner.com)
      if parts.count >= 2
        domains = (%w(studio learn) + CDO.partners).map {|x| x + '.code.org'}
        domain = parts.last(3).join('.').split(':').first
        return domain if domains.include? domain
      end

      # Handle one of our branded urls like: hourofcode.com
      domain = parts.last(2).join('.').split(':').first
      return domain if %w(csedweek.org hourofcode.com codeprojects.org).include?(domain)

      # Otherwise, by fiat, its a pegasus url!
      'code.org'
    end

    def shared_cookie_domain
      @shared_cookie_domain ||= shared_cookie_domain_from_host
    end

    def shared_cookie_domain_from_host
      parts = host.split('.')

      # If its a dev url like: hourofcode.com.localhost or studio.code.org.localhost
      # the cookie domain is not shared, its the whole hostname sans port.
      return host.split(':').first if parts.last.split(':').first == 'localhost' && parts.count > 1

      # All *code.org domains share the same cookie domain: code.org
      if parts.count >= 2
        domain_suffix = parts.last(2).join('.')
        return domain_suffix if domain_suffix == 'code.org'
      end
      host
    end

    def splat_path_info
      env[:splat_path_info]
    end

    def user_id
      @user_id ||= user_id_from_session_store
    end

    # Fetch the user ID directly from the underlying Rails session store. This
    # is a bit of a hack, but is necessary to preserve backwards compatibility.
    def user_id_from_session_store
      session_cookie_key = "_learn_session"
      session_cookie_key += "_#{rack_env}" unless rack_env?(:production)

      message = CGI.unescape(cookies[session_cookie_key].to_s)
      session_id = Rack::Session::SessionId.new(message)

      # Fetch session data from the session store; this is essentially a manual
      # reimplementation of the private `get_session_with_fallback` method
      # which is used by `find_session` under the hood.
      # See https://github.com/redis-store/redis-rack/blob/v3.0.0/lib/rack/session/redis.rb#L87-L89
      session = dashboard_session_store.with do |connection|
        connection.get(session_id.private_id) || connection.get(session_id.public_id)
      end
      return nil unless session
      return nil unless warden = session['warden.user.user.key']
      warden.first.first
    rescue
      return nil
    end

    def country
      env['HTTP_CLOUDFRONT_VIEWER_COUNTRY'] ||
        location&.country_code
    end

    def gdpr?
      gdpr_country_code?(country)
    end

    # Initialize a private instance of the SessionStore used in Dashboard, so
    # we can access data stored there (ie, the id of the current user).
    private def dashboard_session_store
      @dashboard_session_store ||= Dashboard::Application.config.session_store.new(
        Dashboard::Application,
        Dashboard::Application.config.session_options
      )
    end
  end
end
Rack::Request.prepend Cdo::RequestExtension
ActionDispatch::Request.prepend(Cdo::RequestExtension) if defined?(ActionDispatch::Request)
