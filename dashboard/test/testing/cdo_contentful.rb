require 'cdo_contentful'

CdoContentful.configure do |config|
  config.hour_of_ai.client.access_token = ENV.fetch('CONTENTFUL_HOUR_OF_AI_ACCESS_TOKEN', 'fake_access_token')
  config.marketing.client.access_token = 'fake_access_token'
end
