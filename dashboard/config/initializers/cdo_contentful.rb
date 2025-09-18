# frozen_string_literal: true

require 'cdo_contentful'

CdoContentful.configure do |config|
  config.cs_for_all.client.tap do |client|
    client.access_token = CDO.contentful_cs_for_all_access_token
    client.space        = CDO.contentful_cs_for_all_space if CDO.contentful_cs_for_all_space
    client.api_url      = CDO.contentful_cs_for_all_api_url if CDO.contentful_cs_for_all_api_url
    client.namespace    = CDO.contentful_cs_for_all_namespace if CDO.contentful_cs_for_all_namespace
  end
end
