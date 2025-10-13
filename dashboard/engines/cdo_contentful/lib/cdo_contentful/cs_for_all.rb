# frozen_string_literal: true

module CdoContentful
  module CsForAll
    mattr_accessor :config

    self.config = ActiveSupport::OrderedOptions.new.tap do |config|
      config.client = ActiveSupport::OrderedOptions.new.tap do |client|
        client.space = '27jkibac934d'
        client.access_token = nil
        client.api_url = 'preview.contentful.com'
        client.namespace = 'master'
      end
    end.freeze

    private_class_method :config=
  end
end
