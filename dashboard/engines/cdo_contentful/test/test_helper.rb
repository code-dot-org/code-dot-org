# frozen_string_literal: true

ENV['RACK_ENV'] ||= 'test'
ENV['RAILS_ENV'] ||= 'test'

require 'bundler/setup'
require 'logger'
require 'rails'
require 'rails/test_help'
require 'minitest/autorun'
require 'minitest/spec'

require 'cdo_contentful'
# The cassettes were recorded against these spaces. Running code gets its values from CDO.
CdoContentful.configure do |config|
  config.hour_of_ai.client.space = 'hwu8vzk5v0g2'
  config.hour_of_ai.client.api_url = 'preview.contentful.com'
  config.hour_of_ai.client.access_token = ENV.fetch('CONTENTFUL_HOUR_OF_AI_ACCESS_TOKEN', 'fake_access_token')
  config.marketing.client.space = '90t6bu6vlf76'
  config.marketing.client.access_token = 'fake_access_token'
end

require 'vcr'
VCR.configure do |config|
  config.cassette_library_dir = File.join(__dir__, 'fixtures', 'vcr_cassettes')
  config.hook_into :webmock

  config.default_cassette_options = {
    record: :once,
  }

  config.before_record do |interaction|
    interaction.request.headers = {}
  end
end
