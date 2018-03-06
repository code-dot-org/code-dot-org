class UrlConverter
  # For reference, a 'host' is a domain and (optionally) port without a protocol.
  # Examples: code.org, studio.code.org, localhost-studio.code.org:3000
  # @see https://developer.mozilla.org/en-US/docs/Web/API/Location
  def initialize(dashboard_host: nil, pegasus_host: nil, hourofcode_host: nil,
    csedweek_host: nil)
    @dashboard_host = dashboard_host
    @pegasus_host = pegasus_host
    @hourofcode_host = hourofcode_host
    @csedweek_host = csedweek_host
  end

  # An 'origin' is a protocol, domain, and (optional) port.  This method may
  # replace all three.
  def replace_origin(url)
    if @dashboard_host
      raise 'Should not use learn.code.org' unless /\/\/learn.code.org(?=$|\/)/.match(url).nil?
      url = url.
        gsub(/\/\/studio.code.org(?=$|\/)/, "//" + @dashboard_host)
    end
    if @pegasus_host
      url = url.gsub(/\/\/code.org(?=$|\/)/, "//" + @pegasus_host)
    end
    if @hourofcode_host
      url = url.gsub(/\/\/hourofcode.com(?=$|\/)/, "//" + @hourofcode_host)
    end
    if @csedweek_host
      url = url.gsub(/\/\/csedweek.org(?=$|\/)/, "//" + @csedweek_host)
    end

    # Convert http to https
    url = url.gsub(/^http:\/\//, 'https://') unless url.start_with? 'http://localhost'
    # Convert x.y.code.org to x-y.code.org
    url.gsub(/(\w+)\.(\w+)\.code\.org/, '\1-\2.code.org')
  end
end
