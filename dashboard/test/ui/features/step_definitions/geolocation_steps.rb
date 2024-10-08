require 'cdo/rack/geolocation_override'

Given /^I use a cookie to mock my IP address as "([^"]*)"$/ do |ip_address|
  @browser.manage.add_cookie(name: Rack::GeolocationOverride::KEY, value: ip_address)
end

Given "I am in Europe" do
  # Make sure we navigate to the domain we want to set the cookie for
  url = @browser.current_url
  unless url.include?('code.org')
    navigate_to replace_hostname('http://studio.code.org')
  end

  # Get an appropriately european IP address
  location_cookie = '102.177.191.255' # Spain
  steps %Q[Given I use a cookie to mock my IP address as "#{location_cookie}"]
end

Given 'I am in Iran' do
  iran_ip_address = '103.215.223.255'
  steps %Q[Given I use a cookie to mock my IP address as "#{iran_ip_address}"]
end
