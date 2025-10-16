require 'cdo_contentful'

CdoContentful.configure do |config|
  config.cs_for_all.client.access_token = 'fake_access_token'
  config.marketing.client.access_token = 'fake_access_token'
end
