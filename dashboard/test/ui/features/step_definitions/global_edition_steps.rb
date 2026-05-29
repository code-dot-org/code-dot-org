require 'uri'
require 'rack/utils'

When 'I switch to the Global Edition region {string}' do |region_code|
  uri = URI(@browser.current_url&.start_with?('http') ? @browser.current_url : 'http://studio.code.org')

  params = Rack::Utils.parse_nested_query(uri.query)
  params['ge_region'] = region_code
  uri.query = Rack::Utils.build_query(params)

  steps %Q[When I am on "#{uri}"]
end
