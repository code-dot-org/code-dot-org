# frozen_string_literal: true

module CdoContentful
  module Marketing
    mattr_accessor :config

    self.config = ActiveSupport::OrderedOptions.new.tap do |config|
      config.client = ActiveSupport::OrderedOptions.new.tap do |client|
        client.space = '90t6bu6vlf76'
        client.access_token = nil
        client.api_url = 'cdn.contentful.com'
      end
    end.freeze

    private_class_method :config=
  end
end
