# frozen_string_literal: true

require 'cdo_contentful'

CdoContentful.configure do |config|
  config.cs_for_all.client = CDO.cdo_contentful_cs_for_all_client
end
