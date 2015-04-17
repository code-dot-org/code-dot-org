module Rack
  class Request
    def json_body()
      return nil unless content_type.split(';').first == 'application/json'
      return nil unless content_charset.downcase == 'utf-8'
      JSON.parse(body.read, symbolize_names:true)
    end

    def language()
      locale.split('-').first
    end

    def locale()
      env['cdo.locale'] || 'en-US'
    end

    def referer_site_with_port()
      begin
        url = URI.parse(self.referer.to_s)
        host = http_host_and_port(url.host, url.port)
        return host if host.include?('csedweek.org')
        return host if host.include?('code.org')
        return 'code.org'
      rescue URI::InvalidURIError
        return 'code.org'
      end
    end

    def site()
      @site ||= site_from_host
    end

    def site_from_host()
      parts = host.split('.')
      if parts.count >= 3
        domain = parts.last(3).join('.').split(':').first
        return domain if ['studio.code.org', 'learn.code.org', 'translate.hourofcode.com', 'i18n.code.org',
                          'al.code.org', 'ar.code.org', 'br.code.org', 'italia.code.org', 'ro.code.org',
                          'eu.code.org', 'uk.code.org', 'za.code.org'].include?(domain)
      end

      domain = parts.last(2).join('.').split(':').first
      return domain if ['csedweek.org','hourofcode.com'].include?(domain)

      'code.org'
    end

    def splat_path_info()
      self.env[:splat_path_info]
    end

    def user_id()
      @user_id ||= user_id_from_session_cookie
    end

    def user_id_from_session_cookie()
      begin
        session_cookie_key = "_learn_session"
        session_cookie_key += "_#{rack_env}" unless rack_env?(:production)

        message = CGI.unescape(cookies[session_cookie_key].to_s)

        key_generator = ActiveSupport::KeyGenerator.new(
          CDO.dashboard_secret_key_base,
          iterations:1000
        )

        encryptor = ActiveSupport::MessageEncryptor.new(
          key_generator.generate_key('encrypted cookie'),
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
end
