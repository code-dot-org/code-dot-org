require 'uri'
require 'rack/utils'

Given 'Global Edition is enabled' do
  steps <<-STEPS
    Given I am on "http://studio.code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"
  STEPS
end

When 'I switch to the Global Edition region {string}' do |region_code|
  uri = URI(@browser.current_url.presence || 'http://studio.code.org')

  params = Rack::Utils.parse_nested_query(uri.query)
  params['ge_region'] = region_code
  uri.query = Rack::Utils.build_query(params)

  steps %Q[When I am on "#{uri}"]
end
