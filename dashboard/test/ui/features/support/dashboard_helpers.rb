require 'cdo/cdo_cli'
require 'cdo/rack/cookie_dcdo'

module DashboardHelpers
  include CdoCli

  # Requires the full rails environment. Use sparingly, known to take 20-30s.
  def require_rails_env
    return if @rails_loaded
    puts 'Requiring rails env'
    start = Time.now
    require File.expand_path('../../../../../config/environment.rb', __FILE__)
    finish = Time.now
    puts "Requiring rails env took #{finish - start} seconds"
    @rails_loaded = true
  end

  # Mocks DCDO for a test scenario by setting the DCDO cookie, which overrides the actual value set in DCDO per domain.
  # @param key [String] DCDO key
  # @param value [Object] DCDO value
  # @see Rack::CookieDCDO
  # @note Navigating to the tested page before mocking DCDO is necessary to ensure it's mocked for the correct domain.
  # @note DCDO mocked on the "studio.code.org" domain isn't available on "hourofcode.com" but is accessible on "code.org".
  def mock_dcdo(key, value)
    dcdo_cookie_value = JSON.parse(get_cookie(Rack::CookieDCDO::KEY).try(:[], :value).presence || '{}')
    dcdo_cookie_value[key] = value

    current_host = URI(@browser.current_url.to_s).host
    current_domain = current_host && PublicSuffix.parse(current_host).domain

    dcdo_cookie = {name: Rack::CookieDCDO::KEY, value: dcdo_cookie_value.to_json}
    dcdo_cookie[:domain] = ".#{current_domain}" if current_domain # sets the cookie for the top-level domain

    @browser.manage.add_cookie(dcdo_cookie)
  rescue Selenium::WebDriver::Error::InvalidCookieDomainError
    warn red("WARNING: First, navigate the page for which domain you want to mock the DCDO `#{key}`")
    raise
  end
end

World(DashboardHelpers)
