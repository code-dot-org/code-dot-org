require 'cdo/rack/geolocation_override'

Given "I am in Europe" do
  # Make sure we navigate to the domain we want to set the cookie for
  url = @browser.current_url
  unless url.include?('code.org')
    navigate_to replace_hostname('http://studio.code.org')
  end

  # Get an appropriately european IP address
  location_cookie = '102.177.191.255' # Spain
  @browser.manage.add_cookie(name: Rack::GeolocationOverride::KEY, value: location_cookie)
end
