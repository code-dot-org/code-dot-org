class UrlConverter
  # (?=$|\/) is a lookahead.
  # It means "The next thing must be the end of the string or a forward slash"
  # It prevents us from matching something like //code.org.example.com
  LEARN_CODE_ORG_REGEX = /#{'//learn.code.org'}(?=$|\/)/
  HOUROFCODE_COM_REGEX = /#{'//hourofcode.com'}(?=$|\/)/
  CSEDWEEK_ORG_REGEX = /#{'//csedweek.org'}(?=$|\/)/
  DASHBOARD_REGEX = /#{'//studio.code.org'}(?=$|\/)/
  ADVOCACY_REGEX = /#{'//advocacy.code.org'}(?=$|\/)/

  # For reference, a 'host' is a domain and (optionally) port without a protocol.
  # Examples: code.org, studio.code.org, localhost-studio.code.org:3000
  # @see https://developer.mozilla.org/en-US/docs/Web/API/Location
  def initialize(dashboard_host: nil, pegasus_host: nil, hourofcode_host: nil,
    csedweek_host: nil, advocacy_host: nil)
    @dashboard_host = dashboard_host
    @pegasus_host = pegasus_host
    @hourofcode_host = hourofcode_host
    @csedweek_host = csedweek_host
    @advocacy_host = advocacy_host
  end

  # An 'origin' is a protocol, domain, and (optional) port.  This method may
  # replace all three.
  def replace_origin(url)
    if @dashboard_host
      raise 'Should not use learn.code.org' unless LEARN_CODE_ORG_REGEX.match(url).nil?
    end

    if @hourofcode_host && HOUROFCODE_COM_REGEX =~ url
      url = url.gsub(HOUROFCODE_COM_REGEX, "//" + @hourofcode_host)
    elsif @csedweek_host && CSEDWEEK_ORG_REGEX =~ url
      url = url.gsub(CSEDWEEK_ORG_REGEX, "//" + @csedweek_host)
    elsif @advocacy_host && ADVOCACY_REGEX =~ url
      url = url.gsub(ADVOCACY_REGEX, "//" + @advocacy_host)
    elsif @dashboard_host && DASHBOARD_REGEX =~ url
      url = url.gsub(DASHBOARD_REGEX, "//" + @dashboard_host)
    elsif @pegasus_host
      # Handle pegasus subdomains
      # This regex has a named capture group for the particular subdomain
      if url =~ /#{'//'}(?<subdomain>\w+)#{'.code.org'}/
        subdomain = $~[:subdomain]
        url = url.gsub(/#{'//'}\w+#{'.code.org'}(?=$|\/)/, "//" + @pegasus_host)
        url = url.gsub(/#{'.code.org'}/, "-#{subdomain}.code.org")
      else
        url = url.gsub(/#{'//code.org'}(?=$|\/)/, "//" + @pegasus_host)
      end
    end

    # Convert http to https
    url = url.gsub(/^#{'http://'}/, 'https://') unless url.start_with? 'http://localhost'
    # Convert x.y.code.org to x-y.code.org
    url.gsub(/(\w+)\.(\w+)#{'.code.org'}/, '\1-\2.code.org')
  end
end
