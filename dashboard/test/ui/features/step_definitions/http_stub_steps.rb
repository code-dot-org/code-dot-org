require 'cgi'
require 'json'

require 'cdo/rack/http_stub'

Given(/^I use a cookie to stub matching HTTP requests from the "(.*)" fixture:$/) do |name, stubs|
  name = CGI.escape(name)

  stubs = stubs.raw.map do |(method, pattern, value)|
    {}.tap do |stub|
      stub[:method]  = method
      stub[:pattern] = CGI.escape(Regexp.escape(pattern))
      stub[:value]   = JSON.parse(value) if value.present?
    end
  end

  add_cookie Rack::HttpStub::COOKIE_KEY, JSON.dump(name:, stubs:)
rescue Selenium::WebDriver::Error::InvalidCookieDomainError
  warn red("WARNING: First, navigate the page for which domain you want to stub the HTTP requests `#{name}`")
  raise
end
