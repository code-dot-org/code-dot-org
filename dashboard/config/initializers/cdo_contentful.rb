# frozen_string_literal: true

require 'cdo_contentful'

CdoContentful.configure do |config|
  config.hour_of_ai.client.tap do |client|
    client.access_token = CDO.contentful_hour_of_ai_access_token
    client.space        = CDO.contentful_hour_of_ai_space
    client.api_url      = CDO.contentful_hour_of_ai_api_url
    client.environment  = CDO.contentful_hour_of_ai_environment
  end

  config.marketing.client.tap do |client|
    client.access_token = CDO.contentful_api_key
    client.space        = CDO.contentful_space_id
    client.api_url      = CDO.contentful_hostname
  end
end
