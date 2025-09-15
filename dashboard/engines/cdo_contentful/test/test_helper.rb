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
CdoContentful.configure do |config|
  config.cs_for_all.client.access_token = 'fake_access_token'
end

require 'vcr'
VCR.configure do |config|
  config.cassette_library_dir = File.join(__dir__, 'fixtures', 'vcr_cassettes')
  config.hook_into :webmock
  config.default_cassette_options = {record: :once}
end
