module Rack; class Request

  def json_body()
    return nil unless content_type.split(';').first == 'application/json'
    return nil unless content_charset.downcase == 'utf-8'
    JSON.parse(body.read, symbolize_names:true)
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

  def splat_path_info()
    self.env[:splat_path_info]
  end

end; end;
