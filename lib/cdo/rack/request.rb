require 'rack/request'
require 'ipaddr'
require 'json'

module Cdo
  module RequestExtension
    TRUSTED_PROXIES = JSON.parse(IO.read(deploy_dir('lib/cdo/trusted_proxies.json')))['ranges'].map do |proxy|
      IPAddr.new(proxy)
    end

    def trusted_proxy?(ip)
      super(ip) || TRUSTED_PROXIES.any? {|proxy| proxy === ip rescue false}
    end

    def json_body
      return nil unless content_type.split(';').first == 'application/json'
      return nil unless content_charset.downcase == 'utf-8'
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

    def site_from_host
      host_parts = host
      # staging-studio.code.org -> ['staging', 'studio', 'code', 'org']
      host_parts.sub!('-', '.') unless rack_env?(:production)
      parts = host_parts.split('.')

      if parts.count >= 3
        domains = (%w(studio learn advocacy) + CDO.partners).map {|x| x + '.code.org'}
        domain = parts.last(3).join('.').split(':').first
        return domain if domains.include? domain
      end

      domain = parts.last(2).join('.').split(':').first
      return domain if %w(csedweek.org hourofcode.com codeprojects.org).include?(domain)

      'code.org'
    end

    def shared_cookie_domain
      @shared_cookie_domain ||= shared_cookie_domain_from_host
    end

    def shared_cookie_domain_from_host
      parts = host.split('.')
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
      @user_id ||= user_id_from_session_cookie
    end

    def user_id_from_session_cookie
      session_cookie_key = "_learn_session"
      session_cookie_key += "_#{rack_env}" unless rack_env?(:production)

      message = CGI.unescape(cookies[session_cookie_key].to_s)

      key_generator = ActiveSupport::KeyGenerator.new(
        CDO.dashboard_secret_key_base,
        iterations: 1000
      )

      encryptor = ActiveSupport::MessageEncryptor.new(
        key_generator.generate_key('encrypted cookie')[0, ActiveSupport::MessageEncryptor.key_len],
        key_generator.generate_key('signed encrypted cookie')
      )

      return nil unless cookie = encryptor.decrypt_and_verify(message)
      return nil unless warden = cookie['warden.user.user.key']
      warden.first.first
    rescue
      return nil
    end
  end
end
Rack::Request.prepend Cdo::RequestExtension
ActionDispatch::Request.prepend(Cdo::RequestExtension) if defined?(ActionDispatch::Request)
