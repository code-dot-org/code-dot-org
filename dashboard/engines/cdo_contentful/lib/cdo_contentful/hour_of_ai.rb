# frozen_string_literal: true

module CdoContentful
  module HourOfAi
    mattr_accessor :config

    self.config = ActiveSupport::OrderedOptions.new.tap do |config|
      config.client = ActiveSupport::OrderedOptions.new.tap do |client|
        client.space = 'hwu8vzk5v0g2'
        client.access_token = nil
        client.api_url = 'preview.contentful.com'
        client.namespace = 'master'
      end
    end.freeze

    private_class_method :config=
  end
end
